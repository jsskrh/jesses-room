import React from "react";
import "./Page.css";
import ToggleBar from "./ToggleBar";

function Page() {
  return (
    <div className="page">
      <ToggleBar />
      <div className="page-wrapper">
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

        <section className="about-section section left">
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

        <section className="works-section section right">
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

        <div className="second-margin section-margin"></div>

        <section className="works-section section left">
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

        <div className="second-margin section-margin"></div>

        <section className="contact-section section left">
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

        <div className="second-margin section-margin"></div>

        <section className="finally-section section right">
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
