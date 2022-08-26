import React, { useEffect } from "react";
import GSAP from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { useStateValue } from "./StateProvider";
import { useState } from "react";

function Animations({ ready, roomObject, children }) {
  const [{ reduxSections, camera, monitorLight, lampLight, tankLight }] =
    useStateValue();

  const [room, setRoom] = useState({});

  useEffect(() => {
    if (ready) {
      setRoom(roomObject.scene);
    }
  });

  useEffect(() => {
    if (ready) {
      const actualRoom = room;
      const orthographicCamera = camera;

      GSAP.registerPlugin(ScrollTrigger);

      ScrollTrigger.matchMedia({
        // Desktop
        "(min-width: 969px)": () => {
          actualRoom.scale.set(0.11, 0.11, 0.11);
          //monitorLight.width = 0.724;
          //monitorLight.height = 0.3515;
          //tankLight.width = 0.5;
          //tankLight.height = 1.015;
          //lampLight.width = 0.1;
          //lampLight.height = 0.1;

          // First Section
          const firstMoveTimeline = new GSAP.timeline({
            scrollTrigger: {
              trigger: ".first-margin",
              markers: true,
              start: "top top",
              end: "bottom bottom",
              scrub: 0.6,
              invalidateOnRefresh: true,
            },
          }).to(actualRoom.position, {
            x: () => {
              return innerWidth * 0.00145;
            },
          });

          // Second Section
          const secondMoveTimeline = new GSAP.timeline({
            scrollTrigger: {
              trigger: ".second-margin",
              markers: true,
              start: "top top",
              end: "bottom bottom",
              scrub: 0.6,
              invalidateOnRefresh: true,
            },
          })
            .to(
              actualRoom.position,
              {
                x: () => {
                  return 1;
                },
                z: () => {
                  return innerHeight * 0.0055;
                },
              },
              "same"
            )
            .to(
              actualRoom.scale,
              {
                x: 0.4,
                y: 0.4,
                z: 0.4,
              },
              "same"
            );
          //.to(
          //  monitorLight,
          //  {
          //    width: 0.724 * 4,
          //    height: 0.3515 * 4,
          //  },
          //  "same"
          //);

          // Third Section
          const thirdMoveTimeline = new GSAP.timeline({
            scrollTrigger: {
              trigger: ".third-margin",
              markers: true,
              start: "top top",
              end: "bottom bottom",
              scrub: 0.6,
              invalidateOnRefresh: true,
            },
          }).to(orthographicCamera.position, {
            x: 2,
            y: 8.5,
          });

          // Fourth Section
          const fourthMoveTimeline = new GSAP.timeline({
            scrollTrigger: {
              trigger: ".fourth-margin",
              markers: true,
              start: "top top",
              end: "bottom bottom",
              scrub: 0.6,
              invalidateOnRefresh: true,
            },
          }).to(orthographicCamera.position, {
            x: -3.5,
            y: -3,
          });

          // Fifth Section
          const fifthMoveTimeline = new GSAP.timeline({
            scrollTrigger: {
              trigger: ".fifth-margin",
              markers: true,
              start: "top top",
              end: "bottom bottom",
              scrub: 0.6,
              invalidateOnRefresh: true,
            },
          })
            .to(
              actualRoom.position,
              {
                x: () => {
                  return innerWidth * -0.00175;
                },
                z: () => {
                  return 0;
                },
              },
              "same"
            )
            .to(
              actualRoom.scale,
              {
                x: 0.11,
                y: 0.11,
                z: 0.11,
              },
              "same"
            )
            //.to(
            //  monitorLight,
            //  {
            //    width: 0.724,
            //    height: 0.3515,
            //  },
            //  "same"
            //)
            .to(
              orthographicCamera.position,
              {
                x: 0,
                y: 4,
                z: 5,
              },
              "same"
            );
        },

        // Mobile
        "(max-width: 968px)": () => {
          // Room in mobile
          actualRoom.scale.set(0.07, 0.07, 0.07);
          actualRoom.position.set(-0.05, 0, 0);
          //monitorLight.width = 0.4607;
          //monitorLight.height = 0.2237;
          //tankLight.width = 0.3181;
          //tankLight.height = 0.6459;
          //lampLight.width = 0.0636;
          //lampLight.height = 0.0636;

          // First Section
          const firstMoveTimeline = new GSAP.timeline({
            scrollTrigger: {
              trigger: ".first-margin",
              markers: true,
              start: "top top",
              end: "bottom bottom",
              scrub: 0.6,
              invalidateOnRefresh: true,
            },
          }).to(
            actualRoom.scale,
            {
              x: 0.1,
              y: 0.1,
              z: 0.1,
            },
            "same"
          );

          // Second Section
          const secondMoveTimeline = new GSAP.timeline({
            scrollTrigger: {
              trigger: ".second-margin",
              markers: true,
              start: "top top",
              end: "bottom bottom",
              scrub: 0.6,
              invalidateOnRefresh: true,
            },
          })
            .to(
              actualRoom.position,
              {
                x: 1.5,
                z: () => {
                  return innerHeight * 0.0025;
                },
              },
              "same"
            )
            .to(
              actualRoom.scale,
              {
                x: 0.25,
                y: 0.25,
                z: 0.25,
              },
              "same"
            );
          //.to(
          //  monitorLight,
          //  {
          //    width: 0.724 * 3.4,
          //    height: 0.3515 * 3.4,
          //  },
          //  "same"
          //);

          // Third Section
          const thirdMoveTimeline = new GSAP.timeline({
            scrollTrigger: {
              trigger: ".third-margin",
              markers: true,
              start: "top top",
              end: "bottom bottom",
              scrub: 0.6,
              invalidateOnRefresh: true,
            },
          }).to(orthographicCamera.position, {
            x: 3.56,
            y: 6.5,
          });

          // Fourth Section
          const fourthMoveTimeline = new GSAP.timeline({
            scrollTrigger: {
              trigger: ".fourth-margin",
              markers: true,
              start: "top top",
              end: "bottom bottom",
              scrub: 0.6,
              invalidateOnRefresh: true,
            },
          }).to(orthographicCamera.position, {
            x: -0.02,
            y: -0.55,
          });

          // Fifth Section
          const fifthMoveTimeline = new GSAP.timeline({
            scrollTrigger: {
              trigger: ".fifth-margin",
              markers: true,
              start: "top top",
              end: "bottom bottom",
              scrub: 0.6,
              invalidateOnRefresh: true,
            },
          })
            .to(
              actualRoom.position,
              {
                x: -0.05,
                z: 0,
                y: 0,
              },
              "same"
            )
            .to(
              actualRoom.scale,
              {
                x: 0.07,
                y: 0.07,
                z: 0.07,
              },
              "same"
            )
            //.to(
            //  monitorLight,
            //  {
            //    width: 0.724,
            //    height: 0.3515,
            //  },
            //  "same"
            //)
            .to(
              orthographicCamera.position,
              {
                x: 0,
                y: 4,
                z: 5,
              },
              "same"
            );
        },

        // all
        all: function () {
          // ScrollTriggers created here aren't associated with a particular media query,
          // so they persist.
          // Mini platform animation
          const secondPartTimeline = new GSAP.timeline({
            scrollTrigger: {
              trigger: ".fourth-margin",
              markers: true,
              start: "center center",
            },
          });

          let first;
          let second;
          let third;
          let fourth;
          let fifth;
          let sixth;
          let seventh;
          let eigth;
          let ninth;

          actualRoom.children.forEach((child) => {
            if (child.name === "Floor") {
              first = GSAP.to(child.position, {
                x: 3.07688,
                z: 2.66616,
                ease: "back.out(2)",
                duration: 0.3,
              });
            }

            // set origin to bottom
            if (child.name === "Mailbox") {
              second = GSAP.to(child.scale, {
                x: 1,
                y: 1,
                z: 1,
                ease: "back.out(2)",
                duration: 0.3,
              });
            }

            if (child.name === "Lamp") {
              third = GSAP.to(child.scale, {
                x: 1,
                y: 1,
                z: 1,
                ease: "back.out(2)",
                duration: 0.3,
              });
            }

            if (child.name === "Floor_Pad001") {
              fourth = GSAP.to(child.scale, {
                x: 1,
                y: 1,
                z: 1,
                ease: "back.out(2)",
                duration: 0.3,
              });
            }

            if (child.name === "Floor_Pad002") {
              fifth = GSAP.to(child.scale, {
                x: 1,
                y: 1,
                z: 1,
                ease: "back.out(2)",
                duration: 0.3,
              });
            }

            if (child.name === "Floor_Pad003") {
              sixth = GSAP.to(child.scale, {
                x: 1,
                y: 1,
                z: 1,
                ease: "back.out(2)",
                duration: 0.3,
              });
            }

            if (child.name === "Flower_Pad") {
              seventh = GSAP.to(child.scale, {
                x: 1,
                y: 1,
                z: 1,
                ease: "back.out(2)",
                duration: 0.3,
              });
            }

            if (child.name === "Flower001") {
              eigth = GSAP.to(child.scale, {
                x: 1,
                y: 1,
                z: 1,
                ease: "back.out(2)",
                duration: 0.3,
              });
            }

            if (child.name === "Flower002") {
              ninth = GSAP.to(child.scale, {
                x: 1,
                y: 1,
                z: 1,
                ease: "back.out(2)",
                duration: 0.3,
              });
            }
          });
          secondPartTimeline.add(first);
          secondPartTimeline.add(second);
          secondPartTimeline.add(third);
          secondPartTimeline.add(fourth, "-=0.2");
          secondPartTimeline.add(fifth, "-=0.2");
          secondPartTimeline.add(sixth, "-=0.2");
          secondPartTimeline.add(seventh, "-=0.2");
          secondPartTimeline.add(eigth);
          secondPartTimeline.add(ninth, "-=0.1");

          const sections = reduxSections;
          sections.forEach((section) => {
            const progressWrapper = section.querySelector(".progress-wrapper");
            const progressBar = section.querySelector(".progress-bar");

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

            GSAP.fromTo(
              progressBar,
              {
                scaleY: 0,
              },
              {
                scaleY: 1,
                scrollTrigger: {
                  trigger: section,
                  start: "top top",
                  end: "bottom bottom",
                  scrub: 0.4,
                  pin: progressWrapper,
                  pinSpacing: false,
                },
              }
            );
          });
        },
      });
    }
  }, [room]);

  return <div>{children}</div>;
}

export default Animations;
