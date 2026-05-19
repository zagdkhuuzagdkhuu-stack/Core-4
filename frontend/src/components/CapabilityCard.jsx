export default function CapabilityCard({ eyebrow, title, children }) {
  return (
    <article className="capability-card">
      <p>{eyebrow}</p>
      <h3>{title}</h3>
      <div>{children}</div>
    </article>
  );
}
