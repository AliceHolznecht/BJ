import AnimatedTitle from "./AnimatedTitle";
import Button from "./Button";

const Contact = () => {
  return (
    <div id="contact" className="my-20 min-h-96 w-screen px-10">
      <div className="relative rounded-lg bg-black py-56 text-blue-50 sm:overflow-hidden">
        <div className="flex flex-col items-center text-center">
          <p className="mb-10 font-general font-medium text-[11px] uppercase">
            BJ STUDIO
          </p>

          <AnimatedTitle
            title="let&#39;s b<b>u</b>ild the <br /> new digital era<br /> t<b>o</b>gether."
            className="special-font !md:text-[6.2rem] w-full font-bj !text-5xl !font-black !leading-[.9]"
          />
          <a
            href="https://www.linkedin.com/in/brynner-jonathan-46925228b?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-10 cursor-pointer"
          >
            <Button title="contact me" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default Contact;