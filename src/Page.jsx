import { useEffect, useRef } from "react";
import "./Page.css";
import ToggleBar from "./ToggleBar";
import GSAP from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

function useArrayRef() {
  const refs = useRef([]);
  refs.current = [];
  return [refs, (ref) => ref && refs.current.push(ref)];
}

function Page({ pageRef }) {
  /* const sectionRef = useRef(null); */
  /* const sections = []; */
  const [sections, setSection] = useArrayRef();
  const progressWrapperRef = useRef(null);
  const progressBarRef = useRef(null);

  useEffect(() => {
    GSAP.registerPlugin(ScrollTrigger);

    ScrollTrigger.matchMedia({
      // all
      all: function () {
        // ScrollTriggers created here aren't associated with a particular media query,
        // so they persist.
        sections.current.forEach((section) => {
          const progressWrapper = section.children[0].children[0];
          const progressBar = progressWrapper.children[0];
          console.log(progressBar);

          if (section.classList.contains("right")) {
            GSAP.to(section, {
              borderTopLeftRadius: 10,
              scrollTrigger: {
                trigger: section,
                start: "top bottom",
                end: "top top",
                scrub: 0.6,
                markers: true,
              },
            });
            GSAP.to(section, {
              borderBottomLeftRadius: 700,
              scrollTrigger: {
                trigger: section,
                start: "bottom bottom",
                end: "bottom top",
                scrub: 0.6,
                markers: true,
              },
            });
          } else {
            GSAP.to(section, {
              borderTopRightRadius: 10,
              scrollTrigger: {
                trigger: section,
                start: "top bottom",
                end: "top top",
                scrub: 0.6,
                markers: true,
              },
            });
            GSAP.to(section, {
              borderBottomRightRadius: 700,
              scrollTrigger: {
                trigger: section,
                start: "bottom bottom",
                end: "bottom top",
                scrub: 0.6,
                markers: true,
              },
            });
          }

          GSAP.from(progressBar, {
            scaleY: 0,
            scrollTrigger: {
              trigger: section,
              start: "top top",
              end: "bottom bottom",
              scrub: 0.4,
              pin: progressWrapper,
              pinSpacing: false,
            },
          });
        });
      },
    });
  }, [sections]);

  return (
    <div className="page">
      <ToggleBar />
      <div className="page-wrapper" asscroll="true" ref={pageRef}>
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

        <section className="about-section section left" ref={setSection}>
          <div
            className="progress-wrapper progress-bar-wrapper-left"
            ref={progressWrapperRef}
          >
            <div
              className="progress-bar pink-background"
              ref={progressBarRef}
            ></div>
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

        <section className="works-section section right" ref={setSection}>
          <div
            className="progress-wrapper progress-bar-wrapper-right"
            ref={progressWrapperRef}
          >
            <div
              className="progress-bar green-background"
              ref={progressBarRef}
            ></div>
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

        <section className="works-section section left" ref={setSection}>
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

        <section className="contact-section section left" ref={setSection}>
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

        <section className="finally-section section right" ref={setSection}>
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
