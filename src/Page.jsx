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
                Fullstack Developer
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
              <h3 className="text-head">Lorem Ipsum</h3>
              <p className="text">
                Lorem ipsum dolor sit, amet consectetur adipisicing elit.
                Dignissimos dolor consectetur in a natus quidem quos eius cum
                alias vero porro, repellat vel at voluptate numquam dolorem ipsa
                cumque accusamus.
              </p>
              <h3 className="text-head">Lorem Ipsum</h3>
              <p className="text">
                Lorem ipsum dolor sit, amet consectetur adipisicing elit.
                Dignissimos dolor consectetur in a natus quidem quos eius cum
                alias vero porro, repellat vel at voluptate numquam dolorem ipsa
                cumque accusamus.
              </p>
              <h3 className="text-head">Lorem Ipsum</h3>
              <p className="text">
                Lorem ipsum dolor sit, amet consectetur adipisicing elit.
                Dignissimos dolor consectetur in a natus quidem quos eius cum
                alias vero porro, repellat vel at voluptate numquam dolorem ipsa
                cumque accusamus.
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
              <h3 className="text-head">Lorem Ipsum</h3>
              <p className="text">
                Lorem ipsum dolor sit, amet consectetur adipisicing elit.
                Dignissimos dolor consectetur in a natus quidem quos eius cum
                alias vero porro, repellat vel at voluptate numquam dolorem ipsa
                cumque accusamus.
              </p>
              <h3 className="text-head">Lorem Ipsum</h3>
              <p className="text">
                Lorem ipsum dolor sit, amet consectetur adipisicing elit.
                Dignissimos dolor consectetur in a natus quidem quos eius cum
                alias vero porro, repellat vel at voluptate numquam dolorem ipsa
                cumque accusamus.
              </p>
              <h3 className="text-head">Lorem Ipsum</h3>
              <p className="text">
                Lorem ipsum dolor sit, amet consectetur adipisicing elit.
                Dignissimos dolor consectetur in a natus quidem quos eius cum
                alias vero porro, repellat vel at voluptate numquam dolorem ipsa
                cumque accusamus.
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
              <h3 className="text-head">Lorem Ipsum</h3>
              <p className="text">
                Lorem ipsum dolor sit, amet consectetur adipisicing elit.
                Dignissimos dolor consectetur in a natus quidem quos eius cum
                alias vero porro, repellat vel at voluptate numquam dolorem ipsa
                cumque accusamus.
              </p>
              <p className="text">
                Lorem ipsum dolor sit, amet consectetur adipisicing elit.
                Dignissimos dolor consectetur in a natus quidem quos eius cum
                alias vero porro, repellat vel at voluptate numquam dolorem ipsa
                cumque accusamus.
              </p>
            </div>
          </div>
        </section>

        <div className="fourth-margin section-margin"></div>

        <section
          className="contact-section section left"
          ref={setSection}
          key={3}
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
              <h3 className="text-head">Lorem Ipsum</h3>
              <p className="text">
                Lorem ipsum dolor sit, amet consectetur adipisicing elit.
                Dignissimos dolor consectetur in a natus quidem quos eius cum
                alias vero porro, repellat vel at voluptate numquam dolorem ipsa
                cumque accusamus.
              </p>
            </div>
          </div>
        </section>

        <div className="fifth-margin section-margin"></div>

        <section
          className="finally-section section right"
          ref={setSection}
          key={4}
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
                Lorem ipsum dolor sit, amet consectetur adipisicing elit.
                Dignissimos dolor consectetur in a natus quidem quos eius cum
                alias vero porro, repellat vel at voluptate numquam dolorem ipsa
                cumque accusamus.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Page;
