import './Commissions.css';

const commissionOptions = [
  'Portrait commissions',
  'Custom illustrations',
  'Seasonal greeting pieces',
  'Brand and story visuals',
];

export default function Commissions() {
  return (
    <section className="page">
      <h1>Commissions</h1>
      <p>Commission a one-of-a-kind piece shaped around your vision.</p>

      <ul>
        {commissionOptions.map((option) => (
          <li key={option}>{option}</li>
        ))}
      </ul>
    </section>
  );
}