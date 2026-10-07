import Image from "next/image";

const carriers = [
  { name: "Americo", logo: "americo.png" },
  { name: "Transamerica", logo: "transamerica.jpg" },
  { name: "Aetna", logo: "aetna.png" },
  { name: "Mutual of Omaha", logo: "mutual-of-omaha.png" },
  { name: "Liberty Bankers", logo: "liberty-bankers.png" },
  { name: "American Amicable", logo: "american-amicable.png" },
];

export function CarrierMarquee() {
  return (
    <section className="carrier-section" id="insurance-companies" aria-labelledby="carrier-heading">
      <div className="container">
        <div className="carrier-heading-row">
          <h2 id="carrier-heading"><span />Insurance companies</h2>
        </div>
        <div className="carrier-window" tabIndex={0} role="region" aria-label="Insurance company logos">
          <div className="carrier-track">
            {[0, 1].map(copy => (
              <ul className="carrier-group" key={copy} aria-hidden={copy === 1 ? true : undefined}>
                {carriers.map(carrier => (
                  <li className="carrier-item" key={carrier.name}>
                    <div className="carrier-logo">
                      <Image src={`/images/carriers/${carrier.logo}`} alt={copy === 0 ? carrier.name : ""} width={200} height={76} sizes="200px" />
                    </div>
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
