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
        "w-full md:w-auto font-bold text-slate-800 text-center",
        "sm:p-2 md:text-left md:mr-20  p-2",
        "animated-color-hover",
        autoRunActive ? "auto-run" : "",
        smallText === "Sign Up" ? "text-[14px]" : "text-[12px]",
      ].join(" ")}
    >
      <span className="block lg:hidden">{smallText}</span>
      <span className="hidden lg:inline-block">{bigText}</span>
    </h1>
  );
}
