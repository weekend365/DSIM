const features = [
  '여행 성향과 꿈꾸는 목적지로 동행자 매칭',
  '일정·예산·안전 취향을 함께 맞추기',
  '채팅, 비용 분담, 동선 계획까지 한 곳에서'
];

export default function HomePage() {
  return (
    <section className="space-y-8">
      <div className="space-y-4 text-center">
        <p className="text-sm uppercase tracking-[0.4em] text-brand-600">동상일몽</p>
        <h1 className="text-3xl font-bold sm:text-4xl">
          같은 자리에서 하나의 꿈을 꾸는 사람들의 연결
        </h1>
        <p className="text-lg text-slate-600">
          나와 여행 템포, 관심사, 예산이 맞는 사람을 찾고 함께 계획을 세우세요.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {features.map((feature) => (
          <article
            key={feature}
            className="rounded-xl border border-slate-200 bg-white/90 p-5 text-left shadow-sm"
          >
            <p className="text-sm text-slate-500">기능 미리보기</p>
            <p className="mt-2 text-base font-medium text-slate-800">{feature}</p>
          </article>
        ))}
      </div>
      <div className="flex flex-wrap gap-3 justify-center">
        <a
          className="rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/40"
          href="/home"
        >
          시작하기
        </a>
        <a
          className="rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold"
          href="/explore"
        >
          여행 살펴보기
        </a>
      </div>
    </section>
  );
}
