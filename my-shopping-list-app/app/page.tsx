import { Link } from "@nextui-org/link";
import { Card } from "@nextui-org/card";
import { button as buttonStyles } from "@nextui-org/theme";

import { title, subtitle } from "@/components/primitives";
import { ListIcon, ShoppingCartIcon } from "@/components/icons";

export default function Home() {
  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <div className="inline-block max-w-lg text-center justify-center">
        <h1 className={title()}>Organizujte&nbsp;</h1>
        <h1 className={title({ color: "violet" })}>efektivně&nbsp;</h1>
        <br />
        <h1 className={title()}>s naší chytrou aplikací pro správu seznamů.</h1>
        <h2 className={subtitle({ class: "mt-4" })}>
          Vytvářejte, spravujte a sdílejte své nákupní a úkolové seznamy s
          lehkostí.
        </h2>
      </div>

      <div className="flex gap-3">
        <Link
          className={buttonStyles({
            color: "primary",
            radius: "full",
            variant: "shadow",
          })}
          href="/lists"
        >
          <ShoppingCartIcon size={20} />
          Nákupní seznamy
        </Link>
        <Link
          className={buttonStyles({ variant: "bordered", radius: "full" })}
          href="/lists"
        >
          <ListIcon size={20} />
          Úkolové seznamy
        </Link>
      </div>

      <div className="mt-8 flex gap-4">
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-2">Nákupy bez starostí</h3>
          <p>Organizujte své nákupy a nikdy nezapomeňte na žádnou položku.</p>
        </Card>
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-2">Správa úkolů</h3>
          <p>Sledujte své každodenní úkoly a zvyšte svou produktivitu.</p>
        </Card>
      </div>
    </section>
  );
}
