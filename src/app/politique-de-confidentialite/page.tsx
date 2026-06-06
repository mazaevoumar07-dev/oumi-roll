import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Politique de confidentialité — OUMI ROLL",
  description: "Comment OUMI ROLL collecte, utilise et protège vos données personnelles conformément au RGPD.",
};

const RESTAURANT_NAME    = "OUMI ROLL";
const RESTAURANT_ADDRESS = "6 rue Flammarion, 72100 Le Mans";
const RESTAURANT_PHONE   = "+33 6 02 21 06 68";
const RESTAURANT_EMAIL   = "contact@oumiroll.fr";
const LAST_UPDATED       = "6 juin 2026";

export default function PolitiqueDeConfidentialitePage() {
  return (
    <>
      <div className="min-h-[calc(100vh-72px)] bg-[#0D0D0D] py-16 px-5">
        <div className="max-w-[780px] mx-auto">

          {/* En-tête */}
          <div className="mb-12 border-b border-[#2A2A2A] pb-10">
            <Link
              href="/"
              className="inline-flex items-center gap-2 font-[family-name:var(--font-dm-sans)] text-[12px] text-[#8A8A8A] hover:text-[#C8A96E] transition-colors mb-8 tracking-[0.06em] uppercase"
            >
              <ArrowLeftIcon />
              Retour à l&apos;accueil
            </Link>

            <h1 className="font-[family-name:var(--font-cormorant)] text-[40px] sm:text-[52px] text-[#F0EAD6] font-medium leading-[1.1] mb-4">
              Politique de<br />confidentialité
            </h1>
            <p className="font-[family-name:var(--font-dm-sans)] text-[13px] text-[#8A8A8A]">
              Dernière mise à jour : {LAST_UPDATED}
            </p>
          </div>

          {/* Contenu */}
          <div className="flex flex-col gap-10">

            <Section title="1. Responsable du traitement">
              <p>
                Le responsable du traitement de vos données personnelles est :
              </p>
              <InfoBlock>
                <InfoLine label="Raison sociale" value={RESTAURANT_NAME} />
                <InfoLine label="Adresse" value={RESTAURANT_ADDRESS} />
                <InfoLine label="Téléphone" value={RESTAURANT_PHONE} />
                <InfoLine label="E-mail" value={RESTAURANT_EMAIL} />
              </InfoBlock>
              <p>
                Pour toute question relative à la protection de vos données, vous pouvez nous contacter
                par e-mail à <Highlight>{RESTAURANT_EMAIL}</Highlight> ou par téléphone au{" "}
                <Highlight>{RESTAURANT_PHONE}</Highlight>.
              </p>
            </Section>

            <Section title="2. Données collectées">
              <p>Lors de l&apos;utilisation de notre site, nous collectons les données suivantes :</p>

              <SubSection title="2.1 Données d'compte">
                <ul className="list-disc pl-5 flex flex-col gap-1.5">
                  <li>Prénom et nom de famille</li>
                  <li>Numéro de téléphone (utilisé comme identifiant de connexion)</li>
                  <li>Adresse e-mail (optionnelle, fournie lors de la commande)</li>
                  <li>Mot de passe (stocké sous forme hashée, jamais en clair)</li>
                </ul>
              </SubSection>

              <SubSection title="2.2 Données de commande">
                <ul className="list-disc pl-5 flex flex-col gap-1.5">
                  <li>Adresse de livraison</li>
                  <li>Contenu du panier (articles commandés, quantités, prix)</li>
                  <li>Montant total et frais de livraison</li>
                  <li>Statut et historique de la commande</li>
                  <li>Commentaire de commande (optionnel)</li>
                </ul>
              </SubSection>

              <SubSection title="2.3 Données de paiement">
                <p>
                  Les données bancaires (numéro de carte, CVV, date d&apos;expiration) sont traitées
                  directement par <Highlight>Stripe</Highlight> et ne transitent jamais par nos serveurs.
                  Nous conservons uniquement un identifiant de transaction Stripe pour les éventuels remboursements.
                </p>
              </SubSection>

              <SubSection title="2.4 Données de géolocalisation">
                <p>
                  L&apos;adresse de livraison saisie est transmise à l&apos;API Google Maps Geocoding afin
                  de calculer la distance et le tarif de livraison. Nous ne collectons pas la
                  géolocalisation en temps réel de votre appareil.
                </p>
              </SubSection>

              <SubSection title="2.5 Données de communication (SMS)">
                <p>
                  Si vous avez donné votre consentement lors de l&apos;inscription, nous collectons
                  votre numéro de téléphone à des fins de communication promotionnelle par SMS.
                </p>
              </SubSection>
            </Section>

            <Section title="3. Finalités et bases légales du traitement">
              <table className="w-full border-collapse text-[13px]">
                <thead>
                  <tr className="border-b border-[#2A2A2A]">
                    <Th>Finalité</Th>
                    <Th>Base légale</Th>
                  </tr>
                </thead>
                <tbody>
                  <TableRow
                    purpose="Création et gestion de votre compte client"
                    basis="Exécution du contrat (art. 6.1.b RGPD)"
                  />
                  <TableRow
                    purpose="Traitement et livraison de votre commande"
                    basis="Exécution du contrat (art. 6.1.b RGPD)"
                  />
                  <TableRow
                    purpose="Paiement en ligne via Stripe"
                    basis="Exécution du contrat (art. 6.1.b RGPD)"
                  />
                  <TableRow
                    purpose="Calcul du tarif de livraison (Google Maps)"
                    basis="Exécution du contrat (art. 6.1.b RGPD)"
                  />
                  <TableRow
                    purpose="Envoi de SMS promotionnels"
                    basis="Consentement (art. 6.1.a RGPD) — révocable à tout moment"
                  />
                  <TableRow
                    purpose="Vérification de votre numéro par SMS (OTP)"
                    basis="Exécution du contrat (art. 6.1.b RGPD)"
                  />
                  <TableRow
                    purpose="Historique de vos commandes"
                    basis="Intérêt légitime (art. 6.1.f RGPD) — gestion des litiges et garanties"
                  />
                </tbody>
              </table>
            </Section>

            <Section title="4. Durée de conservation">
              <div className="flex flex-col gap-3">
                <ConservationRow
                  label="Données de compte"
                  value="Jusqu'à la suppression du compte ou 3 ans d'inactivité"
                />
                <ConservationRow
                  label="Données de commande"
                  value="10 ans (obligation légale comptable — L.123-22 du Code de commerce)"
                />
                <ConservationRow
                  label="Historique SMS"
                  value="12 mois"
                />
                <ConservationRow
                  label="Logs techniques"
                  value="90 jours"
                />
              </div>
              <p className="mt-4 text-[#8A8A8A]">
                À l&apos;expiration de ces délais, vos données sont supprimées ou anonymisées
                (remplacement par des valeurs neutres ne permettant plus votre identification).
              </p>
            </Section>

            <Section title="5. Destinataires des données">
              <p>Vos données peuvent être transmises aux sous-traitants suivants, uniquement dans le cadre de la fourniture de leurs services :</p>
              <div className="flex flex-col gap-3 mt-4">
                <RecipientRow
                  name="Stripe, Inc."
                  role="Traitement des paiements par carte bancaire"
                  country="États-Unis (Privacy Shield / SCC)"
                  link="https://stripe.com/fr/privacy"
                />
                <RecipientRow
                  name="Twilio, Inc."
                  role="Envoi de SMS (OTP et communications promotionnelles)"
                  country="États-Unis (SCC)"
                  link="https://www.twilio.com/en-us/legal/privacy"
                />
                <RecipientRow
                  name="Google LLC"
                  role="API Geocoding pour le calcul de la distance de livraison"
                  country="États-Unis (SCC)"
                  link="https://policies.google.com/privacy"
                />
                <RecipientRow
                  name="Supabase, Inc."
                  role="Hébergement de la base de données et authentification"
                  country="Union Européenne (région EU West)"
                  link="https://supabase.com/privacy"
                />
                <RecipientRow
                  name="Vercel, Inc."
                  role="Hébergement de l'application web"
                  country="Union Européenne"
                  link="https://vercel.com/legal/privacy-policy"
                />
              </div>
              <p className="mt-4 text-[#8A8A8A]">
                Aucune de vos données n&apos;est vendue à des tiers ni utilisée à des fins publicitaires par ces sous-traitants dans le cadre de notre relation contractuelle.
              </p>
            </Section>

            <Section title="6. Vos droits (RGPD)">
              <p>Conformément au Règlement Général sur la Protection des Données (UE) 2016/679, vous disposez des droits suivants :</p>
              <div className="flex flex-col gap-4 mt-4">
                <RightRow
                  title="Droit d'accès (art. 15)"
                  description="Vous pouvez demander une copie de toutes les données personnelles que nous détenons sur vous."
                />
                <RightRow
                  title="Droit de rectification (art. 16)"
                  description="Vous pouvez corriger vos données via votre espace client ou en nous contactant directement."
                />
                <RightRow
                  title="Droit à l'effacement (art. 17)"
                  description="Vous pouvez demander la suppression de votre compte et l'anonymisation de vos données personnelles. Les données de commande sont conservées sous forme anonymisée pour respecter nos obligations légales."
                />
                <RightRow
                  title="Droit à la portabilité (art. 20)"
                  description="Vous pouvez demander l'export de vos données dans un format structuré (JSON ou CSV)."
                />
                <RightRow
                  title="Droit d'opposition (art. 21)"
                  description="Vous pouvez à tout moment vous opposer au traitement de vos données à des fins de prospection commerciale. Pour les SMS : répondez STOP à tout SMS reçu ou contactez-nous."
                />
                <RightRow
                  title="Droit de retrait du consentement (art. 7)"
                  description="Si le traitement est fondé sur votre consentement (SMS promotionnels), vous pouvez le retirer à tout moment sans que cela affecte la licéité du traitement antérieur."
                />
              </div>
              <div className="mt-6 p-4 border border-[#C8A96E]/20 rounded-[4px] bg-[#C8A96E]/5">
                <p className="font-[family-name:var(--font-dm-sans)] text-[13px] text-[#F0EAD6] leading-[1.7]">
                  <strong className="text-[#C8A96E]">Pour exercer vos droits :</strong><br />
                  Envoyez votre demande par e-mail à <Highlight>{RESTAURANT_EMAIL}</Highlight> en précisant
                  votre identité. Nous répondrons dans un délai d&apos;un mois (art. 12 RGPD).
                </p>
              </div>
              <p className="mt-4 text-[#8A8A8A] text-[13px]">
                Si vous estimez que vos droits ne sont pas respectés, vous pouvez introduire une
                réclamation auprès de la{" "}
                <a
                  href="https://www.cnil.fr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#C8A96E] hover:text-[#E2C07A] transition-colors"
                >
                  CNIL
                </a>{" "}
                (Commission Nationale de l&apos;Informatique et des Libertés).
              </p>
            </Section>

            <Section title="7. Cookies et technologies similaires">
              <p>
                Notre site utilise des cookies techniques nécessaires au fonctionnement du service
                (session d&apos;authentification, panier). Ces cookies ne nécessitent pas votre consentement
                (art. 82 de la loi Informatique et Libertés).
              </p>
              <p className="mt-3">
                L&apos;utilisation de l&apos;API Google Maps peut entraîner le dépôt de cookies tiers par Google
                sur votre navigateur lors du calcul de la distance de livraison. Ces cookies sont soumis à
                la{" "}
                <a
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#C8A96E] hover:text-[#E2C07A] transition-colors"
                >
                  politique de confidentialité de Google
                </a>
                .
              </p>
            </Section>

            <Section title="8. Sécurité des données">
              <p>
                Nous mettons en œuvre les mesures techniques et organisationnelles suivantes pour
                protéger vos données :
              </p>
              <ul className="list-disc pl-5 flex flex-col gap-1.5 mt-3">
                <li>Chiffrement des communications via HTTPS (TLS 1.3)</li>
                <li>Mots de passe stockés sous forme hashée (bcrypt via Supabase Auth)</li>
                <li>Accès à la base de données restreint par des politiques de sécurité au niveau des lignes (Row Level Security)</li>
                <li>Données de paiement jamais stockées sur nos serveurs — traitées exclusivement par Stripe (certifié PCI-DSS)</li>
                <li>Accès administrateur protégé par authentification distincte</li>
              </ul>
            </Section>

            <Section title="9. Modifications de cette politique">
              <p>
                Nous nous réservons le droit de modifier cette politique à tout moment pour refléter
                les évolutions légales ou techniques. La date de dernière mise à jour est indiquée en
                haut de cette page. En cas de modification substantielle, nous vous en informerons
                par SMS (si vous y avez consenti) ou lors de votre prochaine connexion.
              </p>
            </Section>

            {/* Contact final */}
            <div className="border-t border-[#2A2A2A] pt-10">
              <p className="font-[family-name:var(--font-dm-sans)] text-[13px] text-[#8A8A8A] leading-[1.8]">
                Pour toute question relative à cette politique de confidentialité, contactez-nous :
                <br />
                <a href={`mailto:${RESTAURANT_EMAIL}`} className="text-[#C8A96E] hover:text-[#E2C07A] transition-colors">
                  {RESTAURANT_EMAIL}
                </a>
                {" · "}
                <a href={`tel:${RESTAURANT_PHONE.replace(/\s/g, "")}`} className="text-[#C8A96E] hover:text-[#E2C07A] transition-colors">
                  {RESTAURANT_PHONE}
                </a>
                <br />
                {RESTAURANT_ADDRESS}
              </p>
            </div>

          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

/* ===== Composants internes ===== */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-[family-name:var(--font-cormorant)] text-[26px] sm:text-[30px] text-[#F0EAD6] font-medium">
        {title}
      </h2>
      <div className="font-[family-name:var(--font-dm-sans)] text-[13.5px] text-[#AAAAAA] leading-[1.8] flex flex-col gap-3">
        {children}
      </div>
    </section>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="font-[family-name:var(--font-dm-sans)] text-[12px] tracking-[0.1em] uppercase text-[#C8A96E]">
        {title}
      </h3>
      <div className="font-[family-name:var(--font-dm-sans)] text-[13.5px] text-[#AAAAAA] leading-[1.8]">
        {children}
      </div>
    </div>
  );
}

function InfoBlock({ children }: { children: React.ReactNode }) {
  return (
    <div className="border border-[#2A2A2A] rounded-[4px] p-4 flex flex-col gap-2 bg-[#111]">
      {children}
    </div>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3 text-[13px]">
      <span className="text-[#8A8A8A] min-w-[110px] flex-shrink-0">{label}</span>
      <span className="text-[#F0EAD6]">{value}</span>
    </div>
  );
}

function Highlight({ children }: { children: React.ReactNode }) {
  return <span className="text-[#F0EAD6]">{children}</span>;
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="text-left py-3 px-4 text-[11px] tracking-[0.1em] uppercase text-[#C8A96E] font-[family-name:var(--font-dm-sans)] font-medium">
      {children}
    </th>
  );
}

function TableRow({ purpose, basis }: { purpose: string; basis: string }) {
  return (
    <tr className="border-b border-[#1E1E1E]">
      <td className="py-3 px-4 text-[#AAAAAA] align-top">{purpose}</td>
      <td className="py-3 px-4 text-[#8A8A8A] align-top">{basis}</td>
    </tr>
  );
}

function ConservationRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:gap-6 py-3 border-b border-[#1E1E1E] last:border-0">
      <span className="text-[#F0EAD6] min-w-[200px] text-[13px]">{label}</span>
      <span className="text-[#8A8A8A] text-[13px]">{value}</span>
    </div>
  );
}

function RecipientRow({
  name, role, country, link,
}: {
  name: string; role: string; country: string; link: string;
}) {
  return (
    <div className="border border-[#2A2A2A] rounded-[4px] p-4 bg-[#111] flex flex-col gap-1.5">
      <div className="flex items-start justify-between gap-4">
        <span className="font-medium text-[#F0EAD6] text-[13px]">{name}</span>
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] text-[#C8A96E] hover:text-[#E2C07A] transition-colors whitespace-nowrap flex-shrink-0"
        >
          Politique ↗
        </a>
      </div>
      <span className="text-[#AAAAAA] text-[13px]">{role}</span>
      <span className="text-[#8A8A8A] text-[12px]">{country}</span>
    </div>
  );
}

function RightRow({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[#F0EAD6] text-[13.5px] font-medium">{title}</span>
      <span className="text-[#8A8A8A] text-[13px] leading-[1.7]">{description}</span>
    </div>
  );
}

function ArrowLeftIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}
