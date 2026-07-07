export function LoadingState({ label = 'Loading...' }) {
  return (
    <section className="center-page state-page">
      <div className="loading-spinner" aria-hidden="true" />
      <p>{label}</p>
    </section>
  );
}

export function ErrorState({ title, message }) {
  return (
    <section className="center-page state-page">
      <p className="eyebrow">Unavailable</p>
      <h1>{title}</h1>
      {message && <p className="muted">{message}</p>}
    </section>
  );
}
