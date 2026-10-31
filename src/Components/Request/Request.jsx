import './Request.css';

export default function Request() {
  return (
    <section className="page">
      <h1>Request a Commission</h1>
      <form>
        <label>
          Name
          <input type="text" placeholder="Your name" />
        </label>
        <label>
          Email
          <input type="email" placeholder="you@example.com" />
        </label>
        <label>
          Project details
          <textarea rows="5" placeholder="Tell me about your idea..." />
        </label>
        <button type="submit">Send request</button>
      </form>
    </section>
  );
}