/* Types
interface AuthTitleProps {
  smallText: string;
  bigText: string;
  autoRunActive: boolean;
}

*/
export default function AuthTitle({ smallText, bigText, autoRunActive }) {
  return (
    <h1
      className={[
        "w-full xl:w-auto font-bold text-slate-800 text-center",
        "mb-5 xl:text-left xl:mr-20 text-center mx-auto",
        "animated-color-hover",
        autoRunActive ? "auto-run" : "",
         "text-[32px]",

      ].join(" ")}
    >
      <span className="block xl:hidden">{smallText}</span>
      <span className="hidden xl:inline-block">{bigText}</span>
    </h1>
  );
}
