import { useEffect, useRef, useState } from "react";
import "./Page.css";
import ToggleBar from "./ToggleBar";
import { useStateValue } from "./StateProvider";
import GSAP from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

function useArrayRef() {
  const refs = useRef([]);
  refs.current = [];
  return [refs, (ref) => ref && refs.current.push(ref)];
}

function Page({ roomObject }) {
  const [{ reduxSections }, dispatch] = useStateValue();

  const [room, setRoom] = useState({});

  const hmTitleRef = useRef();
  const hmDescRef = useRef();
  const introTextRef = useRef();
  const hmSubOne = useRef();
  const hmSubTwo = useRef();

  let textRefObj = {};

  const create_text_refs = (textRefs) => {
    dispatch({
      type: "create_text_refs",
      textRefs: textRefs,
    });
  };

  const textLoader = (ref) => {
    const element = ref.current;
    textRefObj[element.className] = element;
    element.style.overflow = "hidden";
    element.innerHTML = element.innerText
      .split("")
      .map((char) => {
        if (char === " ") {
          return `<span>&nbsp</span>`;
        }
        return `<span class="animate-this">${char}</span>`;
      })
      .join("");

    return element;
  };

  useEffect(() => {
    setRoom(roomObject.scene);
  });

  const create_sections = (section) => {
    dispatch({
      type: "create_sections",
      section: section,
    });
  };

  const [sections, setSection] = useArrayRef();

  useEffect(() => {
    textLoader(introTextRef);
    textLoader(hmTitleRef);
    textLoader(hmDescRef);
    textLoader(hmSubOne);
    textLoader(hmSubTwo);

    create_text_refs(textRefObj);

    GSAP.registerPlugin(ScrollTrigger);

    sections.current.forEach((section) => {
      create_sections(section);
    });
  }, []);

  return (
    <div className="page">
      <ToggleBar />
      <div className="page-wrapper" asscroll="true">
        <section className="hero">
          <div className="hero-wrapper">
            <div className="intro-text" ref={introTextRef}>
              Welcome to my portfolio!
            </div>
            <div className="arrow-svg-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" height="48" width="48">
                <path
                  fill="currentColor"
                  d="M24 30.15q-.3 0-.55-.1-.25-.1-.5-.35l-9.9-9.9q-.4-.4-.375-1.075.025-.675.425-1.075.5-.5 1.075-.425.575.075 1.025.475l8.8 8.8 8.8-8.8q.4-.4 1.075-.45.675-.05 1.075.45.5.4.425 1.05-.075.65-.475 1.1l-9.85 9.85q-.25.25-.5.35-.25.1-.55.1Z"
                />
              </svg>
            </div>
            <div className="hero-main hero-bottom">
              <h1 className="hero-main-title" ref={hmTitleRef}>
                Jesse K. Akorah
              </h1>
              <p className="hero-main-description" ref={hmDescRef}>
                Software Engineer
              </p>
            </div>

            <div className="hero-main hero-top">
              <p className="hero-main-subheading subheading-one" ref={hmSubOne}>
                Jesse's Room
              </p>
              <p className="hero-main-subheading subheading-two" ref={hmSubTwo}>
                Portfolio
              </p>
            </div>
          </div>
        </section>

        <div className="first-margin section-margin"></div>

        <section
          className="about-section section left"
          ref={setSection}
          key={0}
        >
          <div className="progress-wrapper progress-bar-wrapper-left">
            <div className="progress-bar pink-background"></div>
          </div>
          <div className="section-header">
            <div className="header-top">
              <span className="section-title-text">About me</span>
              <div className="section-title-decoration bar-one"></div>
              <div className="section-title-decoration bar-two"></div>
              <div className="section-title-decoration bar-three"></div>
            </div>
            <span className="section-number">01</span>
          </div>
          <div className="section-content">
            <div className="section-text">
              <h3 className="text-head">Introduction</h3>
              <p className="text">
                With a passion for engineering scalable and impactful solutions,
                I'm a results-driven Full Stack Developer with over 5 years of
                experience. I'm adept at translating business goals into robust
                technical solutions, leading development teams, and optimizing
                applications for performance and user experience. My expertise
                spans the full software development lifecycle, from initial
                design to deployment and maintenance.
              </p>
              <h3 className="text-head">My Philosophy</h3>
              <p className="text">
                I believe in building software that not only meets the immediate
                needs of a project but also stands the test of time. This means
                prioritizing clean, maintainable code, implementing scalable
                architectures, and embracing collaboration with cross-functional
                teams. I'm constantly learning and adapting to new technologies
                to deliver innovative and efficient solutions.
              </p>
              <h3 className="text-head">Professional Experience</h3>
              <p className="text">
                My professional journey has taken me from spearheading the
                development of key products at Sage Grey Technology to
                optimizing e-commerce platforms at Ebeosi Limited. These
                experiences have equipped me with hands-on skills in
                technologies like the MERN stack (MongoDB, Express.js, React,
                Node.js), LLM development, API development, and cloud
                infrastructure, while also honing my leadership and
                problem-solving abilities.
              </p>
            </div>
          </div>
        </section>

        <div className="second-margin section-margin"></div>

        <section
          className="works-section section right"
          ref={setSection}
          key={1}
        >
          <div className="progress-wrapper progress-bar-wrapper-right">
            <div className="progress-bar green-background"></div>
          </div>
          <div className="section-header">
            <div className="header-top">
              <span className="section-title-text">My Works</span>
              <div className="section-title-decoration bar-one"></div>
              <div className="section-title-decoration bar-two"></div>
              <div className="section-title-decoration bar-three"></div>
            </div>
            <span className="section-number">02</span>
          </div>
          <div className="section-content">
            <div className="section-text">
              <h3 className="text-head">Professional Projects</h3>
              <p className="text">
                I've led and co-led the development of several major
                applications, including the Proxze suite and the Splitmulti
                e-commerce marketplace. These projects involved complex system
                design, full-stack development, and integrating robust payment
                and customer management systems.
              </p>
              <h3 className="text-head">Client Work</h3>
              <p className="text">
                I have a strong track record of working with clients to bring
                their vision to life. From the Liberty Link platform to the SICA
                application, I've delivered custom solutions that translate
                business requirements into functional, responsive, and
                cross-browser compatible websites and applications.
              </p>
              <h3 className="text-head">Design and Development</h3>
              <p className="text">
                I'm passionate about the intersection of design and development.
                I've built products like Wasshh, a full-fledged product, and
                others, meticulously implementing designs from UX/UI mockups to
                ensure a seamless and engaging user experience.
              </p>
            </div>
          </div>
        </section>

        <div className="third-margin section-margin"></div>

        <section
          className="works-section section left"
          ref={setSection}
          key={2}
        >
          <div className="progress-wrapper progress-bar-wrapper-left">
            <div className="progress-bar green-background"></div>
          </div>
          <div className="section-content">
            <div className="section-text">
              <h3 className="text-head project">Liberty Link</h3>
              <p className="text">
                A platform for a shipping and logistics company. I was
                responsible for creating a beautifully designed and highly
                functional website that streamlined their operations and
                provided a seamless user experience.
              </p>
              <h3 className="text-head project">Proxze</h3>
              <p className="text">
                A professional platform I spearheaded, offering a suite of
                applications for various business needs. The project involved
                complex system architecture and MERN stack development to create
                robust web and mobile solutions.
              </p>
              <p className="text">
                This suit of applications includes Proxze, Proxze Business,
                Proxze Enterprise and Proxze Channels, as well as the Proxze
                mobile app.
              </p>
              <h3 className="text-head project">Splitmulti</h3>
              <p className="text">
                An e-commerce marketplace I led, which features a sophisticated
                split payment system. This project required a deep understanding
                of payment gateways, database management, and secure API
                integrations to handle complex financial transactions.
              </p>
              <h3 className="text-head project">Wasshh</h3>
              <p className="text">
                A full-fledged product where I was responsible for the
                end-to-end development of both the web and mobile applications.
                The work included meticulous UI/UX implementation, performance
                optimization, and creating a seamless user experience.
              </p>
              <h3 className="text-head project">Silky Touch</h3>
              <p className="text">
                A client e-commerce website I developed from scratch,
                translating technical specifications and design mockups into a
                fully functional online store. The project emphasized a
                mobile-first design philosophy to ensure cross-device
                compatibility.
              </p>
              <h3 className="text-head project">Regel Technology</h3>
              <p className="text">
                A Software-as-a-Service (SaaS) platform for sending SMS and OTP
                messages. I developed the platform's core APIs, enabling
                companies to seamlessly integrate SMS and OTP functionalities
                into their systems.
              </p>
            </div>
          </div>
        </section>

        <div className="fourth-margin section-margin"></div>

        <section
          className="works-section section left"
          ref={setSection}
          key={3}
        >
          <div className="progress-wrapper progress-bar-wrapper-left">
            <div className="progress-bar green-background"></div>
          </div>
          <div className="section-content">
            <div className="section-text">
              <h3 className="text-head">Technologies and Skills</h3>
              <p className="text">
                My skill set is diverse, reflecting my full-stack expertise. I'm
                highly proficient in{" "}
                <a
                  href="https://developer.mozilla.org/en-US/docs/Web/JavaScript"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-link"
                >
                  JavaScript (ES6+)
                </a>{" "}
                and{" "}
                <a
                  href="https://developer.mozilla.org/en-US/docs/Glossary/TypeScript"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-link"
                >
                  TypeScript
                </a>
                . For front-end development, I specialize in{" "}
                <a
                  href="https://react.dev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-link"
                >
                  React.js
                </a>
                ,{" "}
                <a
                  href="https://nextjs.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-link"
                >
                  Next.js
                </a>
                , and{" "}
                <a
                  href="https://reactnative.dev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-link"
                >
                  React Native
                </a>
                . On the back-end, I leverage{" "}
                <a
                  href="https://nodejs.org/en"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-link"
                >
                  Node.js
                </a>
                ,{" "}
                <a
                  href="https://expressjs.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-link"
                >
                  Express.js
                </a>
                , and
                <a
                  href="https://nestjs.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-link"
                >
                  NestJS
                </a>
                . I also have experience with{" "}
                <a
                  href="https://www.python.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-link"
                >
                  Python
                </a>
                ,{" "}
                <a
                  href="https://go.dev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-link"
                >
                  GO
                </a>{" "}
                and{" "}
                <a
                  href="https://dotnet.microsoft.com/en-us/languages/csharp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-link"
                >
                  C#
                </a>
                .
              </p>
              <p className="text">
                I am proficient in working with{" "}
                <a
                  href="https://www.mongodb.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-link"
                >
                  MongoDB
                </a>
                ,{" "}
                <a
                  href="https://www.postgresql.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-link"
                >
                  PostgreSQL
                </a>
                ,{" "}
                <a
                  href="https://firebase.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-link"
                >
                  Firebase
                </a>
                , and{" "}
                <a
                  href="https://www.mysql.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-link"
                >
                  MySQL
                </a>
                , and well versed in cloud services like{" "}
                <a
                  href="https://aws.amazon.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-link"
                >
                  AWS
                </a>{" "}
                and{" "}
                <a
                  href="https://cloud.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-link"
                >
                  Google Cloud
                </a>
                . I'm skilled in{" "}
                <a
                  href="https://developer.mozilla.org/en-US/docs/Glossary/REST"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-link"
                >
                  API development (REST)
                </a>
                ,{" "}
                <a
                  href="https://aws.amazon.com/microservices/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-link"
                >
                  microservices architecture
                </a>
                , and{" "}
                <a
                  href="https://github.com/resources/articles/devops/ci-cd"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-link"
                >
                  Continuous Integration (CI)
                </a>
                , ensuring my code is not only functional but also scalable and
                well-integrated.
              </p>
            </div>
          </div>
        </section>

        <div className="fifth-margin section-margin"></div>

        <section
          className="contact-section section left"
          ref={setSection}
          key={4}
        >
          <div className="progress-wrapper progress-bar-wrapper-left">
            <div className="progress-bar blue-background"></div>
          </div>
          <div className="section-header">
            <div className="header-top">
              <span className="section-title-text">Contact</span>
              <div className="section-title-decoration bar-one"></div>
              <div className="section-title-decoration bar-two"></div>
              <div className="section-title-decoration bar-three"></div>
            </div>
            <span className="section-number">03</span>
          </div>
          <div className="section-content">
            <div className="section-text">
              <h3 className="text-head">Let's Connect</h3>
              <p className="text">
                I'm always open to discussing new opportunities, collaborations,
                or just talking about the latest in software engineering. You
                can reach me by email at{" "}
                <a href="mailto:jesseakorah@gmail.com" className="text-link">
                  jesseakorah@gmail.com
                </a>
                , or connect with me on{" "}
                <a
                  href="https://www.linkedin.com/in/jesse-akorah-1a54a11a1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-link"
                >
                  LinkedIn
                </a>{" "}
                and explore my projects on{" "}
                <a
                  href="https://github.com/jsskrh"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-link"
                >
                  GitHub
                </a>
                .
              </p>
            </div>
          </div>
        </section>

        <div className="sixth-margin section-margin"></div>

        <section
          className="finally-section section right"
          ref={setSection}
          key={5}
        >
          <div className="progress-wrapper progress-bar-wrapper-right">
            <div className="progress-bar cream-background"></div>
          </div>
          <div className="section-header">
            <div className="header-top">
              <span className="section-title-text">Finally</span>
              <div className="section-title-decoration bar-one"></div>
              <div className="section-title-decoration bar-two"></div>
              <div className="section-title-decoration bar-three"></div>
            </div>
            <span className="section-number">04</span>
          </div>
          <div className="section-content">
            <div className="section-text">
              <p className="text">
                Thank you for taking the time to view my portfolio. I hope
                you've enjoyed exploring my work and learning about my
                experience. I look forward to the possibility of building
                something great together.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Page;
