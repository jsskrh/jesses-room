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
            <div className="hero-main hero-bottom">
              <h1 className="hero-main-title">Jesse K. Akorah</h1>
              <p className="hero-main-description">Fullstack Developer</p>
            </div>

            <div className="hero-main hero-top">
              <p className="hero-main-subheading">Jesse's Room</p>
              <p className="hero-main-subheading">Portfolio</p>
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
