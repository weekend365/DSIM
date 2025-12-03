'use client';

import { useEffect, useState } from 'react';
import { apiFetch, fetchSession } from '../../src/lib/api';
import type { JwtPayload } from '@dsim/shared';

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
  sender?: { id: string; name?: string; email?: string };
}

interface Invitation {
  id: string;
  roomId: string;
  status: string;
  createdAt: string;
  room?: { title?: string | null };
  fromUser?: { id: string; email?: string; name?: string };
}

export default function ChatPage() {
  const [user, setUser] = useState<JwtPayload | null>(null);
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newRoomTitle, setNewRoomTitle] = useState('');
  const [participantIds, setParticipantIds] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [inviteeId, setInviteeId] = useState('');
  const [invitations, setInvitations] = useState<Invitation[]>([]);

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
    } catch (error) {
      console.error('채팅방 불러오기 실패', error);
    }
  };

  const loadMessages = async (roomId: string) => {
    try {
      const data = await apiFetch<ChatMessage[]>(`/chat/rooms/${roomId}/messages`);
      setMessages(data);
      setActiveRoom(roomId);
    } catch (error) {
      console.error('메시지 불러오기 실패', error);
    }
  };

  const handleCreateRoom = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const ids = participantIds
        .split(',')
        .map((id) => id.trim())
        .filter(Boolean);
      const room = await apiFetch<ChatRoom>('/chat/rooms', {
        method: 'POST',
        body: JSON.stringify({ title: newRoomTitle || undefined, participantIds: ids })
      });
      setRooms((prev) => [room, ...prev]);
      setNewRoomTitle('');
      setParticipantIds('');
    } catch (error) {
      console.error('채팅방 생성 실패', error);
    }
  };

  const handleInvite = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!activeRoom || !inviteeId.trim()) return;
    try {
      await apiFetch(`/chat/rooms/${activeRoom}/invitations`, {
        method: 'POST',
        body: JSON.stringify({ toUserId: inviteeId })
      });
      setInviteeId('');
      alert('초대가 전송되었습니다');
    } catch (error) {
      console.error('초대 실패', error);
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
          <input
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            placeholder="참여자 ID를 쉼표로 입력"
            value={participantIds}
            onChange={(e) => setParticipantIds(e.target.value)}
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
              onClick={() => loadMessages(room.id)}
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
                  <div key={msg.id} className="rounded-md border border-slate-100 bg-slate-50 px-3 py-2">
                    <p className="font-medium">{msg.sender?.name || msg.sender?.email || msg.senderId}</p>
                    <p className="text-slate-700">{msg.content}</p>
                    <p className="text-xs text-slate-500">{new Date(msg.createdAt).toLocaleString()}</p>
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
            <form className="mt-3 flex gap-2" onSubmit={handleInvite}>
              <input
                className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                placeholder="초대할 사용자 ID"
                value={inviteeId}
                onChange={(e) => setInviteeId(e.target.value)}
              />
              <button className="rounded-lg border border-slate-200 px-4 py-2 text-sm" type="submit">
                초대하기
              </button>
            </form>
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
    </div>
  );
}
