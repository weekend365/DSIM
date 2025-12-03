'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiFetch, fetchSession } from '../../src/lib/api';
import type { JwtPayload } from '@dsim/shared';
import ProfileModal from '../../components/ProfileModal';

interface ChatRoom {
  id: string;
  title?: string | null;
  members: { userId: string }[];
  messages: { content: string; createdAt: string }[];
}

interface ChatMessage {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
  sender?: { id: string; name?: string; email?: string; profile?: { avatarUrl?: string | null } };
}

interface Invitation {
  id: string;
  roomId: string;
  status: string;
  createdAt: string;
  room?: { title?: string | null };
  fromUser?: { id: string; email?: string; name?: string };
}

interface UserBrief {
  id: string;
  email: string;
  name?: string | null;
}

export default function ChatPage() {
  const [user, setUser] = useState<JwtPayload | null>(null);
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newRoomTitle, setNewRoomTitle] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [selectedInvitee, setSelectedInvitee] = useState<UserBrief | null>(null);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<UserBrief[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const searchParams = useSearchParams();
  const roomFromQuery = useMemo(() => searchParams.get('room'), [searchParams]);
  const [activeMembers, setActiveMembers] = useState<{ userId: string }[]>([]);
  const [profileUserId, setProfileUserId] = useState<string | null>(null);

  useEffect(() => {
    void fetchSession<JwtPayload>().then((session) => {
      if (!session) {
        alert('로그인 후 이용해주세요.');
        window.location.href = '/signin';
        return;
      }
      setUser(session);
      void loadRooms();
      void loadInvitations();
    });
  }, []);

  const loadRooms = async () => {
    try {
      const data = await apiFetch<ChatRoom[]>('/chat/rooms');
      setRooms(data);
      if (roomFromQuery) {
        const found = data.find((r) => r.id === roomFromQuery);
        if (found) {
          void loadMessages(roomFromQuery, found.members);
        }
      }
    } catch (error) {
      console.error('채팅방 불러오기 실패', error);
    }
  };

  const loadMessages = async (roomId: string, memberList?: { userId: string }[]) => {
    try {
      const data = await apiFetch<ChatMessage[]>(`/chat/rooms/${roomId}/messages`);
      setMessages(data);
      setActiveRoom(roomId);
      setActiveMembers(memberList ?? rooms.find((r) => r.id === roomId)?.members ?? []);
    } catch (error) {
      console.error('메시지 불러오기 실패', error);
    }
  };

  const handleCreateRoom = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const room = await apiFetch<ChatRoom>('/chat/rooms', {
        method: 'POST',
        body: JSON.stringify({ title: newRoomTitle || undefined })
      });
      setRooms((prev) => [room, ...prev]);
      setActiveRoom(room.id);
      setNewRoomTitle('');
      void loadMessages(room.id);
    } catch (error) {
      console.error('채팅방 생성 실패', error);
    }
  };

  const openInviteModal = () => {
    if (!activeRoom) {
      alert('먼저 채팅방을 선택하세요.');
      return;
    }
    setInviteModalOpen(true);
  };

  const handleInvite = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!activeRoom || !selectedInvitee) return;
    try {
      await apiFetch(`/chat/rooms/${activeRoom}/invitations`, {
        method: 'POST',
        body: JSON.stringify({ toUserId: selectedInvitee.id })
      });
      setSelectedInvitee(null);
      setSearchResults([]);
      setSearchTerm('');
      setInviteModalOpen(false);
      alert('초대가 전송되었습니다.');
    } catch (error) {
      console.error('초대 실패', error);
    }
  };

  const handleSearch = async (value: string) => {
    setSearchTerm(value);
    if (value.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    setSelectedInvitee(null);
    setSearchLoading(true);
    try {
      const data = await apiFetch<UserBrief[]>(`/users/search?q=${encodeURIComponent(value)}`);
      setSearchResults(data);
    } catch (error) {
      console.error('사용자 검색 실패', error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const loadInvitations = async () => {
    try {
      const data = await apiFetch<Invitation[]>('/chat/invitations');
      setInvitations(data);
    } catch (error) {
      console.error('초대 목록 불러오기 실패', error);
    }
  };

  const respondInvitation = async (id: string, action: 'accept' | 'decline') => {
    try {
      await apiFetch(`/chat/invitations/${id}/respond`, {
        method: 'POST',
        body: JSON.stringify({ action })
      });
      await loadInvitations();
      await loadRooms();
    } catch (error) {
      console.error('초대 응답 실패', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!activeRoom || !newMessage.trim()) return;
    try {
      await apiFetch(`/chat/rooms/${activeRoom}/messages`, {
        method: 'POST',
        body: JSON.stringify({ content: newMessage })
      });
      setNewMessage('');
      await loadMessages(activeRoom);
    } catch (error) {
      console.error('메시지 전송 실패', error);
    }
  };

  // SSE로 실시간 메시지 수신
  useEffect(() => {
    if (!activeRoom) return;
    const evtSource = new EventSource(`/chat/rooms/${activeRoom}/stream`, { withCredentials: true });
    evtSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as ChatMessage;
        setMessages((prev) => [...prev, data]);
      } catch (error) {
        console.error('SSE 파싱 실패', error);
      }
    };
    evtSource.onerror = () => {
      evtSource.close();
    };
    return () => {
      evtSource.close();
    };
  }, [activeRoom]);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <section className="space-y-3 rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm lg:col-span-1">
        <h2 className="text-lg font-semibold">채팅방</h2>
        <form className="space-y-2" onSubmit={handleCreateRoom}>
          <input
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            placeholder="방 제목 (선택)"
            value={newRoomTitle}
            onChange={(e) => setNewRoomTitle(e.target.value)}
          />
          <button className="w-full rounded-lg bg-brand-600 px-3 py-2 text-sm text-white" type="submit">
            방 만들기
          </button>
        </form>
        <div className="space-y-2">
          {rooms.map((room) => (
            <button
              key={room.id}
              className={`w-full rounded-lg border px-3 py-2 text-left text-sm ${
                activeRoom === room.id ? 'border-brand-500 bg-brand-50' : 'border-slate-200 bg-white'
              }`}
              onClick={() => loadMessages(room.id, room.members)}
              type="button"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold">{room.title || '제목 없음'}</span>
                <span className="text-xs text-slate-500">멤버 {room.members.length}</span>
              </div>
              <p className="text-xs text-slate-500">
                {room.messages?.[0]?.content ? `마지막: ${room.messages[0].content}` : '메시지 없음'}
              </p>
            </button>
          ))}
        </div>
      </section>

      <section className="lg:col-span-2 space-y-3 rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">
        <h2 className="text-lg font-semibold">메시지</h2>
        {activeRoom ? (
          <>
            <div className="h-80 overflow-y-auto space-y-2 rounded-lg border border-slate-200 bg-white p-3 text-sm">
              {messages.length === 0 ? (
                <p className="text-slate-500">메시지가 없습니다.</p>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className="flex gap-3 rounded-md border border-slate-100 bg-slate-50 px-3 py-2 cursor-pointer"
                    onClick={() => setProfileUserId(msg.senderId)}
                    title="프로필 보기"
                  >
                    <div className="h-10 w-10 overflow-hidden rounded-full border border-slate-200 bg-white">
                      {msg.sender?.profile?.avatarUrl ? (
                        <img
                          src={msg.sender.profile.avatarUrl}
                          alt="avatar"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">🙂</div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{msg.sender?.name || msg.sender?.email || msg.senderId}</p>
                      <p className="text-slate-700">{msg.content}</p>
                      <p className="text-xs text-slate-500">{new Date(msg.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <form className="flex gap-2" onSubmit={handleSendMessage}>
              <input
                className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                placeholder="메시지 입력"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button className="rounded-lg bg-brand-600 px-4 py-2 text-sm text-white" type="submit">
                보내기
              </button>
            </form>
            <div className="mt-3">
              <p className="text-xs font-semibold text-slate-600">멤버</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {activeMembers.length === 0 ? (
                  <span className="text-xs text-slate-500">멤버 정보가 없습니다.</span>
                ) : (
                  activeMembers.map((m) => (
                    <button
                      key={m.userId}
                      type="button"
                      className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-700 hover:border-brand-500"
                      onClick={() => setProfileUserId(m.userId)}
                    >
                      {m.userId}
                    </button>
                  ))
                )}
              </div>
            </div>
            <button
              className="mt-4 rounded-lg border border-slate-200 px-4 py-2 text-sm"
              type="button"
              onClick={openInviteModal}
            >
              멤버 초대하기
            </button>
          </>
        ) : (
          <p className="text-sm text-slate-500">채팅방을 선택하거나 새로 만드세요.</p>
        )}
      </section>

      <section className="lg:col-span-3 space-y-3 rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">
        <h2 className="text-lg font-semibold">받은 초대</h2>
        {invitations.length === 0 ? (
          <p className="text-sm text-slate-500">대기 중인 초대가 없습니다.</p>
        ) : (
          <div className="grid gap-2 md:grid-cols-2">
            {invitations.map((inv) => (
              <div key={inv.id} className="rounded-lg border border-slate-200 bg-white p-3 text-sm">
                <p className="font-semibold">{inv.room?.title || '제목 없음'}</p>
                <p className="text-slate-500">
                  초대자: {inv.fromUser?.name || inv.fromUser?.email || inv.fromUser?.id}
                </p>
                <div className="mt-2 flex gap-2">
                  <button
                    className="rounded-lg bg-brand-600 px-3 py-1 text-white"
                    onClick={() => respondInvitation(inv.id, 'accept')}
                  >
                    수락
                  </button>
                  <button
                    className="rounded-lg border border-slate-200 px-3 py-1"
                    onClick={() => respondInvitation(inv.id, 'decline')}
                  >
                    거절
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {inviteModalOpen ? (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/50 px-4"
          onClick={() => {
            setInviteModalOpen(false);
            setSearchResults([]);
            setSearchTerm('');
            setSelectedInvitee(null);
          }}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">멤버 초대</h3>
              <button
                className="text-slate-500 hover:text-slate-800"
                onClick={() => {
                  setInviteModalOpen(false);
                  setSearchResults([]);
                  setSearchTerm('');
                  setSelectedInvitee(null);
                }}
              >
                ✕
              </button>
            </div>
            <form className="mt-4 space-y-3" onSubmit={handleInvite}>
              <input
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                placeholder="이메일/이름을 입력하세요"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
              />
              {searchLoading ? (
                <p className="text-xs text-slate-500">검색 중...</p>
              ) : (
                <div className="max-h-64 space-y-1 overflow-y-auto">
                  {searchResults.map((user) => {
                    const isMember = rooms
                      .find((r) => r.id === activeRoom)
                      ?.members.some((m) => m.userId === user.id);
                    const isSelected = selectedInvitee?.id === user.id;
                    return (
                      <button
                        key={user.id}
                        type="button"
                        className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm ${
                          isMember
                            ? 'border-slate-200 bg-slate-50 text-slate-400'
                            : isSelected
                            ? 'border-brand-500 bg-brand-50'
                            : 'border-slate-200 bg-white'
                        }`}
                        disabled={isMember}
                        onClick={() => setSelectedInvitee(user)}
                      >
                        <span className="font-semibold">{user.name || user.email}</span>
                        <span className="text-xs text-slate-500">{user.email}</span>
                        {isMember ? <span className="text-xs">이미 멤버</span> : null}
                        {isSelected ? <span className="text-xs text-brand-600">선택됨</span> : null}
                      </button>
                    );
                  })}
                  {searchTerm && searchResults.length === 0 && !searchLoading ? (
                    <p className="text-xs text-slate-500">검색 결과가 없습니다.</p>
                  ) : null}
                </div>
              )}
              <button
                className="w-full rounded-lg bg-brand-600 px-4 py-2 text-sm text-white disabled:opacity-60"
                type="submit"
                disabled={!selectedInvitee}
              >
                초대 보내기
              </button>
            </form>
          </div>
        </div>
      ) : null}
      {profileUserId ? (
        <ProfileModal userId={profileUserId} isOpen={Boolean(profileUserId)} onClose={() => setProfileUserId(null)} />
      ) : null}
    </div>
  );
}
