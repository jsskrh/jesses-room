import React, { useEffect } from "react";
import GSAP from "gsap";
import * as THREE from "three";
import ScrollTrigger from "gsap/ScrollTrigger";
import { useStateValue } from "./StateProvider";
import { useState } from "react";
import { useMediaQuery } from "react-responsive";

function Animations({ ready, roomObject, children }) {
  const [
    {
      reduxSections,
      camera,
      circleFirst,
      circleSecond,
      circleThird,
      roomChildren,
      textRefs,
    },
  ] = useStateValue();

  const [room, setRoom] = useState({});
  const [roomScales, setRoomScales] = useState({});
  const [viewPort, setViewPort] = useState({});
  const [currentActiveBook, setCurrentActiveBook] = useState(null);
  const [originalBookStates, setOriginalBookStates] = useState({});

  let INTERSECTED;
  let INTERSECTED_DATA;

  const projects = [
    "Project",
    "Project001",
    "Project002",
    "Project005",
    "Project012",
    "Project013",
    null,
    undefined,
  ];

  const projectToBookMapping = {
    "Liberty Link": "project",
    Proxze: "project001",
    Splitmulti: "project002",
    Wasshh: "project005",
    "Silky Touch": "project012",
    "Regel Technology": "project013",
  };

  const projectLinks = {
    project: "https://www.libertylinkplus.com",
    project001: "https://www.proxze.com",
    project002: "https://www.splitmulti.com",
    project005: "https://www.wasshh.com",
    project012: "https://www.silkytouchemporium.com",
    project013: "https://www.regeltechnology.com",
  };

  const isMobile = useMediaQuery({ query: "(max-width: 968px" });

  // useEffect(() => {
  //   if (ready) {
  //     setRoom(roomObject.scene);
  //   }
  // });

  useEffect(() => {
    if (ready) {
      setRoom(roomObject.scene);

      // Store original positions and rotations of all books
      const bookStates = {};
      Object.values(projectToBookMapping).forEach((bookName) => {
        if (roomChildren[bookName]) {
          bookStates[bookName] = {
            position: {
              x: roomChildren[bookName].position.x,
              y: roomChildren[bookName].position.y,
              z: roomChildren[bookName].position.z,
            },
            rotation: {
              x: roomChildren[bookName].rotation.x,
              y: roomChildren[bookName].rotation.y,
              z: roomChildren[bookName].rotation.z,
            },
          };
        }
      });
      setOriginalBookStates(bookStates);
    }
  }, [ready, roomChildren]);

  // Function to animate book pop-out
  const animateBookPopOut = (bookObject, originalState) => {
    const timeline = new GSAP.timeline();

    return timeline
      .to(bookObject.position, {
        x: originalState.position.x - 1.5,
        z: originalState.position.z + 1.5,
      })
      .to(
        bookObject.rotation,
        {
          x: -0.525,
          y: -1.58,
        },
        "same"
      )
      .to(
        bookObject.position,
        {
          x: 13.5,
          y: 11.5,
          z: 10,
        },
        "same"
      )
      .to(
        bookObject.scale,
        {
          x: 5,
          y: 5,
          z: 5,
        },
        "same"
      );
  };

  // Function to animate book return
  const animateBookReturn = (bookObject, originalState) => {
    const timeline = new GSAP.timeline();

    return timeline
      .to(bookObject.rotation, {
        x: originalState.rotation.x,
        y: originalState.rotation.y,
        duration: 0.3,
      })
      .to(
        bookObject.position,
        {
          x: originalState.position.x - 1.5,
          y: originalState.position.y,
          z: originalState.position.z + 1.5,
          duration: 0.3,
        },
        "<"
      )
      .to(
        bookObject.scale,
        {
          x: 1,
          y: 1,
          z: 1,
          duration: 0.3,
        },
        "<"
      )
      .to(bookObject.position, {
        x: originalState.position.x,
        z: originalState.position.z,
        duration: 0.2,
      });
  };

  // Set up scroll triggers for project headings
  useEffect(() => {
    if (ready && room && Object.keys(originalBookStates).length > 0) {
      GSAP.registerPlugin(ScrollTrigger);

      // Use a ref to track current active book to avoid dependency issues
      let activeBookRef = { current: currentActiveBook };
      let isAnimating = false; // Prevent multiple simultaneous animations

      // Debounced function to handle book changes
      const handleBookChange = (newBookName, delay = 0) => {
        if (isAnimating) return; // Prevent overlapping animations

        setTimeout(() => {
          if (isAnimating) return; // Double check after delay

          isAnimating = true;

          // Return current active book if different
          if (activeBookRef.current && activeBookRef.current !== newBookName) {
            const currentBookObj = roomChildren[activeBookRef.current];
            const currentOriginalState =
              originalBookStates[activeBookRef.current];
            if (currentBookObj && currentOriginalState) {
              animateBookReturn(currentBookObj, currentOriginalState);
            }
          }

          // Animate new book if specified
          if (newBookName) {
            const bookObject = roomChildren[newBookName];
            const originalState = originalBookStates[newBookName];
            if (bookObject && originalState) {
              animateBookPopOut(bookObject, originalState);
            }
          }

          activeBookRef.current = newBookName;
          setCurrentActiveBook(newBookName);

          // Reset animation lock after a delay
          setTimeout(() => {
            isAnimating = false;
          }, 300); // Adjust based on your animation duration
        }, delay);
      };

      // Get all project headings
      const projectHeadings = document.querySelectorAll(".text-head.project");

      projectHeadings.forEach((heading, index) => {
        const projectName = heading.textContent.trim();
        const bookName = projectToBookMapping[projectName];
        const isLastHeading = index === projectHeadings.length - 1;
        const isFirstHeading = index === 0;

        if (
          bookName &&
          roomChildren[bookName] &&
          originalBookStates[bookName]
        ) {
          ScrollTrigger.create({
            trigger: heading,
            start: "center center",
            end: "center center",
            onEnter: () => handleBookChange(bookName),
            onEnterBack: () => handleBookChange(bookName),
          });

          // Special trigger for the last heading - return book when it reaches top of screen
          if (isLastHeading) {
            ScrollTrigger.create({
              trigger: heading,
              start: "top top",
              onEnter: () => {
                if (activeBookRef.current === bookName) {
                  handleBookChange(null);
                }
              },
            });
          }

          // Special trigger for the first heading - return book when scrolling up and it reaches bottom of screen
          if (isFirstHeading) {
            ScrollTrigger.create({
              trigger: heading,
              start: "bottom bottom",
              onLeaveBack: () => {
                if (activeBookRef.current === bookName) {
                  handleBookChange(null);
                }
              },
            });
          }
        }
      });

      // Create a trigger to return the last book when scrolling past all projects
      const worksSection = document.querySelector(".works-section");
      if (worksSection) {
        ScrollTrigger.create({
          trigger: worksSection,
          start: "bottom center",
          onEnter: () => {
            if (activeBookRef.current) {
              const bookObject = roomChildren[activeBookRef.current];
              const originalState = originalBookStates[activeBookRef.current];
              if (bookObject && originalState) {
                animateBookReturn(bookObject, originalState);
                activeBookRef.current = null;
                setCurrentActiveBook(null);
              }
            }
          },
        });
      }

      // Cleanup function to kill ScrollTriggers
      return () => {
        ScrollTrigger.getAll().forEach((trigger) => {
          if (
            trigger.vars &&
            trigger.vars.trigger &&
            (trigger.vars.trigger.classList?.contains("text-head") ||
              trigger.vars.trigger.classList?.contains("works-section"))
          ) {
            trigger.kill();
          }
        });
      };
    }
  }, [ready, room, roomChildren, originalBookStates]);

  const firstIntro = () => {
    const actualRoom = room;
    return new Promise((resolve, reject) => {
      const timeline = new GSAP.timeline();
      timeline.set(".animate-this", { y: 0, yPercent: 100 });
      timeline
        .to(".preloader", {
          opacity: 0,
          delay: 1,
          onComplete: () => {
            document.querySelector(".preloader").classList.add("hidden");
          },
        })
        /* .set(document.body, { overflow: "hidden" }) */
        .to(actualRoom.scale, {
          x: 0.017,
          y: 0.017,
          z: 0.017,
          ease: "back.out(2.5)",
          duration: 0.7,
        });

      GSAP.registerPlugin(ScrollTrigger);

      ScrollTrigger.matchMedia({
        "(min-width: 969px)": () => {
          timeline
            .to(actualRoom.position, {
              x: -1.35,
              ease: "power1.out",
            })
            .to(".hero", {
              scrollTrigger: {
                trigger: ".hero",
                start: "top top",
                //end: 800,
                pin: true,
              },
            });
        },

        "(max-width: 968px)": () => {
          timeline.to(actualRoom.position, {
            z: -2.7,
            ease: "power1.out",
          });
        },

        all: () => {
          timeline
            .to(".intro-text .animate-this", {
              yPercent: 0,
              stagger: 0.05,
              ease: "back.out(1.7)",
            })
            /* .to(".hero", {
              scrollTrigger: {
                trigger: ".hero",
                start: "top top",
                //end: 800,
                pin: true,
              },
            }) */
            .to(
              ".arrow-svg-wrapper",
              {
                opacity: 1,
              },
              "same"
            )
            .to(
              ".toggle-bar",
              {
                opacity: 1,
                onComplete: resolve,
              },
              "same"
            );
        },
      });
    });
  };

  const timeline = new GSAP.timeline({});
  const secondIntro = () => {
    console.log("second intro");
    const actualRoom = room;

    new Promise((resolve, reject) => {
      const zero = GSAP.to(".intro-text .animate-this", {
        yPercent: 100,
        stagger: 0.05,
        ease: "back.in(1.7)",
      });

      const zeroPointOne = GSAP.to(".arrow-svg-wrapper", {
        opacity: 0,
      });

      const first = GSAP.to(actualRoom.position, {
        x: isMobile ? -0.1 : 0,
        y: 0,
        z: isMobile ? -1 : 0,
        ease: "power1.out",
        duration: 0.7,
      });

      const second = GSAP.to(actualRoom.rotation, {
        y: 2 * Math.PI,
        duration: 0.7,
      });

      const third = GSAP.to(actualRoom.scale, {
        x: isMobile ? 0.06 : 0.11,
        y: isMobile ? 0.06 : 0.11,
        z: isMobile ? 0.06 : 0.11,
        duration: 0.7,
      });

      const fourth = GSAP.to(roomChildren.planeFloor.position, {
        y: -0.4,
        duration: 0.7,
      });

      const fifth = GSAP.to(roomChildren.cube.scale, {
        x: 0,
        y: 0,
        z: 0,
        duration: 0.75,
      });

      const fifthPointOne = GSAP.to(roomChildren.false_wall.scale, {
        x: 0,
        y: 0,
        z: 0,
        duration: 0.75,
      });

      const sixth = GSAP.to(roomChildren.table.scale, {
        x: 1,
        y: 1,
        z: 1,
        ease: "back.out(2.2)",
        duration: 0.5,
      });

      const seventh = GSAP.to(roomChildren.mini_table.scale, {
        x: 1,
        y: 1,
        z: 1,
        ease: "back.out(2.2)",
        duration: 0.5,
      });

      const eighth = GSAP.to(roomChildren.book_shelf.scale, {
        x: 1,
        y: 1,
        z: 1,
        ease: "back.out(2.2)",
        duration: 0.5,
      });

      const eighthPointOne = GSAP.to(roomChildren.project.scale, {
        x: 1,
        y: 1,
        z: 1,
        ease: "back.out(2.2)",
        duration: 0.5,
      });

      const eighthPointTwo = GSAP.to(roomChildren.project001.scale, {
        x: 1,
        y: 1,
        z: 1,
        ease: "back.out(2.2)",
        duration: 0.5,
      });

      const eighthPointThree = GSAP.to(roomChildren.project002.scale, {
        x: 1,
        y: 1,
        z: 1,
        ease: "back.out(2.2)",
        duration: 0.5,
      });

      const eighthPointFour = GSAP.to(roomChildren.project003.scale, {
        x: 1,
        y: 1,
        z: 1,
        ease: "back.out(2.2)",
        duration: 0.5,
      });

      const eighthPointFive = GSAP.to(roomChildren.project004.scale, {
        x: 1,
        y: 1,
        z: 1,
        ease: "back.out(2.2)",
        duration: 0.5,
      });

      const eighthPointSix = GSAP.to(roomChildren.project005.scale, {
        x: 1,
        y: 1,
        z: 1,
        ease: "back.out(2.2)",
        duration: 0.5,
      });

      const eighthPointSeven = GSAP.to(roomChildren.project006.scale, {
        x: 1,
        y: 1,
        z: 1,
        ease: "back.out(2.2)",
        duration: 0.5,
      });

      const eighthPointEight = GSAP.to(roomChildren.project007.scale, {
        x: 1,
        y: 1,
        z: 1,
        ease: "back.out(2.2)",
        duration: 0.5,
      });

      const eighthPointNine = GSAP.to(roomChildren.project008.scale, {
        x: 1,
        y: 1,
        z: 1,
        ease: "back.out(2.2)",
        duration: 0.5,
      });

      const eighthPointTen = GSAP.to(roomChildren.project009.scale, {
        x: 1,
        y: 1,
        z: 1,
        ease: "back.out(2.2)",
        duration: 0.5,
      });

      const eighthPointEleven = GSAP.to(roomChildren.project010.scale, {
        x: 1,
        y: 1,
        z: 1,
        ease: "back.out(2.2)",
        duration: 0.5,
      });

      const eighthPointTwelve = GSAP.to(roomChildren.project011.scale, {
        x: 1,
        y: 1,
        z: 1,
        ease: "back.out(2.2)",
        duration: 0.5,
      });

      const eighthPointThirteen = GSAP.to(roomChildren.project012.scale, {
        x: 1,
        y: 1,
        z: 1,
        ease: "back.out(2.2)",
        duration: 0.5,
      });

      const eighthPointFourteen = GSAP.to(roomChildren.project013.scale, {
        x: 1,
        y: 1,
        z: 1,
        ease: "back.out(2.2)",
        duration: 0.5,
      });

      const eighthPointFifteen = GSAP.to(roomChildren.project014.scale, {
        x: 1,
        y: 1,
        z: 1,
        ease: "back.out(2.2)",
        duration: 0.5,
      });

      const ninth = GSAP.to(roomChildren.mat.scale, {
        x: 1,
        y: 1,
        z: 1,
        ease: "back.out(2.2)",
        duration: 0.5,
      });

      const tenth = GSAP.to(roomChildren.drawers.scale, {
        x: 1,
        y: 1,
        z: 1,
        ease: "back.out(2.2)",
        duration: 0.5,
      });

      const eleventh = GSAP.to(roomChildren.trash_can.scale, {
        x: 1,
        y: 1,
        z: 1,
        ease: "back.out(2.2)",
        duration: 0.5,
      });

      const twelfth = GSAP.to(
        roomChildren.chair_legs.scale,
        {
          x: 1,
          y: 1,
          z: 1,
          ease: "back.out(2.2)",
          duration: 0.5,
        }
        /* "chair" */
      );

      const thirteenth = GSAP.to(
        roomChildren.chair.scale,
        {
          x: 1,
          y: 1,
          z: 1,
          ease: "back.out(2.2)",
          duration: 0.5,
        }
        /* "chair" */
      );

      const fourteenth = GSAP.to(
        roomChildren.chair.rotation,
        {
          y: 4 * Math.PI + (6 * Math.PI) / 4,
          ease: "power2.out",
          duration: 1,
        }
        /* "chair" */
      );

      const fifteenth = GSAP.to(roomChildren.table_top.scale, {
        x: 1,
        y: 1,
        z: 1,
        ease: "back.out(2.2)",
        duration: 0.5,
      });

      const sixteenth = GSAP.to(roomChildren.monitor.scale, {
        x: 1,
        y: 1,
        z: 1,
        ease: "back.out(2.2)",
        duration: 0.5,
      });

      const seventeenth = GSAP.to(roomChildren.keyboard.scale, {
        x: 1,
        y: 1,
        z: 1,
        ease: "back.out(2.2)",
        duration: 0.5,
      });

      const eighteenth = GSAP.to(roomChildren.macbook_stand.scale, {
        x: 1,
        y: 1,
        z: 1,
        ease: "back.out(2.2)",
        duration: 0.5,
      });

      const ninteenth = GSAP.to(roomChildren.mouse_pad.scale, {
        x: 1,
        y: 1,
        z: 1,
        ease: "back.out(2.2)",
        duration: 0.5,
      });

      const twentieth = GSAP.to(roomChildren.mug.scale, {
        x: 1,
        y: 1,
        z: 1,
        ease: "back.out(2.2)",
        duration: 0.5,
      });

      const twentyFirst = GSAP.to(roomChildren.flower_pot.scale, {
        x: 1,
        y: 1,
        z: 1,
        ease: "back.out(2.2)",
        duration: 0.5,
      });

      const twentySecond = GSAP.to(roomChildren.macbook.scale, {
        x: 1,
        y: 1,
        z: 1,
        ease: "back.out(2.2)",
        duration: 0.5,
      });

      const twentyThird = GSAP.to(roomChildren.painting.scale, {
        x: 1,
        y: 1,
        z: 1,
        ease: "back.out(2.2)",
        duration: 0.5,
      });

      const twentyFourth = GSAP.to(roomChildren.painting001.scale, {
        x: 1,
        y: 1,
        z: 1,
        ease: "back.out(2.2)",
        duration: 0.5,
      });

      const twentyFifth = GSAP.to(roomChildren.painting002.scale, {
        x: 1,
        y: 1,
        z: 1,
        ease: "back.out(2.2)",
        duration: 0.5,
      });

      const twentySixth = GSAP.to(roomChildren.clock.scale, {
        x: 1,
        y: 1,
        z: 1,
        ease: "back.out(2.2)",
        duration: 0.5,
      });

      const twentySeventh = GSAP.to(roomChildren.shelf001.scale, {
        x: 1,
        y: 1,
        z: 1,
        ease: "back.out(2.2)",
        duration: 0.5,
      });

      const twentyEighth = GSAP.to(roomChildren.shelf002.scale, {
        x: 1,
        y: 1,
        z: 1,
        ease: "back.out(2.2)",
        duration: 0.5,
      });

      const twentyNinth = GSAP.to(roomChildren.shelf_lamp.scale, {
        x: 1,
        y: 1,
        z: 1,
        ease: "back.out(2.2)",
        duration: 0.5,
      });

      const thirtieth = GSAP.to(roomChildren.table_book.scale, {
        x: 1,
        y: 1,
        z: 1,
        ease: "back.out(2.2)",
        duration: 0.5,
      });

      const thirtyFirst = GSAP.to(roomChildren.table_book001.scale, {
        x: 1,
        y: 1,
        z: 1,
        ease: "back.out(2.2)",
        duration: 0.5,
      });

      const thirtySecond = GSAP.to(roomChildren.shelf_book.scale, {
        x: 1,
        y: 1,
        z: 1,
        ease: "back.out(2.2)",
        duration: 0.5,
      });

      const thirtyThird = GSAP.to(roomChildren.shelf_box.scale, {
        x: 1,
        y: 1,
        z: 1,
        ease: "back.out(2.2)",
        duration: 0.5,
      });

      const thirtyFourth = GSAP.to(roomChildren.shelf_book001.scale, {
        x: 1,
        y: 1,
        z: 1,
        ease: "back.out(2.2)",
        duration: 0.5,
      });

      const thirtyFifth = GSAP.to(roomChildren.shelf_book003.scale, {
        x: 1,
        y: 1,
        z: 1,
        ease: "back.out(2.2)",
        duration: 0.5,
      });

      const thirtySixth = GSAP.to(roomChildren.shelf_book004.scale, {
        x: 1,
        y: 1,
        z: 1,
        ease: "back.out(2.2)",
        duration: 0.5,
      });

      const thirtySeventh = GSAP.to(roomChildren.shelf_book005.scale, {
        x: 1,
        y: 1,
        z: 1,
        ease: "back.out(2.2)",
        duration: 0.5,
      });

      const thirtyEighth = GSAP.to(roomChildren.shelf_book002.scale, {
        x: 1,
        y: 1,
        z: 1,
        ease: "back.out(2.2)",
        duration: 0.5,
      });

      const thirtyNinth = GSAP.to(roomChildren.batman.scale, {
        x: 1,
        y: 1,
        z: 1,
        ease: "back.out(2.2)",
        duration: 0.5,
      });

      const fourtieth = GSAP.to(".hero-main-title .animate-this", {
        yPercent: 0,
        stagger: 0.05,
        ease: "back.out(1.7)",
      });

      const fourtyFirst = GSAP.to(".hero-main-description .animate-this", {
        yPercent: 0,
        stagger: 0.05,
        ease: "back.out(1.7)",
      });

      const fourtySecond = GSAP.to(".subheading-one .animate-this", {
        yPercent: 0,
        stagger: 0.05,
        ease: "back.out(1.7)",
      });

      const fourtyThird = GSAP.to(".subheading-two .animate-this", {
        yPercent: 0,
        stagger: 0.05,
        ease: "back.out(1.7)",
      });

      const fourtyFourth = GSAP.to(".arrow-svg-wrapper", {
        opacity: 1,
        onComplete: resolve,
      });

      const fourtyFifth = GSAP.set("body", {
        overflow: "auto",
        onComplete: resolve,
      });

      timeline.add(zero);

      timeline.add(first, "start");
      timeline.add(second, "start");
      timeline.add(third, "start");
      timeline.add(fourth, "start");
      timeline.add(fifth, ">+=0.1");
      timeline.add(fifthPointOne, "<");
      timeline.add(sixth);
      timeline.add(seventh, "-=0.1");
      timeline.add(eighth, "-=0.1");
      timeline.add(twelfth, "chairKeyboard");
      timeline.add(eighthPointOne, "firstbook");
      timeline.add(eighthPointTwo, "<+=0.1");
      timeline.add(eighthPointThree, "<+=0.1");
      timeline.add(eighthPointFour, "<+=0.1");
      timeline.add(eighthPointFive, "<+=0.1");
      timeline.add(eighthPointSix, "<+=0.1");
      timeline.add(eighthPointSeven, "<+=0.1");
      timeline.add(eighthPointEight, "<+=0.1");
      timeline.add(eighthPointNine, "<+=0.1");
      timeline.add(eighthPointTen, "<+=0.1");
      timeline.add(eighthPointEleven, "<+=0.1");
      timeline.add(eighthPointTwelve, "<+=0.1");
      timeline.add(eighthPointThirteen, "<+=0.1");
      timeline.add(eighthPointFourteen, "<+=0.1");
      timeline.add(eighthPointFifteen, "<+=0.1");
      timeline.add(ninth, "firstbook");
      timeline.add(tenth, ">-=0.15");
      timeline.add(eleventh, ">-=0.15");
      timeline.add(thirteenth, "chairKeyboard");
      timeline.add(fourteenth, "chairKeyboard");
      timeline.add(fifteenth, "chairKeyboard-=0.2");
      timeline.add(sixteenth, ">");
      timeline.add(seventeenth, "chairKeyboard");
      timeline.add(eighteenth, "-=0.1");
      timeline.add(ninteenth, "-=0.1");
      timeline.add(twentieth, "chairKeyboard+=1");
      timeline.add(twentyFirst, "<+=0.1");
      timeline.add(twentySecond, "<+=0.1");
      timeline.add(twentyThird, "chairKeyboard+=0.3");
      timeline.add(twentyFourth, ">-=0.3");
      timeline.add(twentyFifth, ">-=0.3");
      timeline.add(twentySixth, ">-=0.3");
      timeline.add(twentySeventh, "chairKeyboard+=0.2");
      timeline.add(twentyEighth, "<+=0.2");
      timeline.add(twentyNinth, "<+=0.1");
      timeline.add(thirtieth, "<+=0.1");
      timeline.add(thirtyFirst, "<+=0.1");
      timeline.add(thirtySecond, "<+=0.1");
      timeline.add(thirtyThird, "<+=0.1");
      timeline.add(thirtyFourth, "<+=0.1");
      timeline.add(thirtyFifth, "<+=0.1");
      timeline.add(thirtySixth, "<+=0.1");
      timeline.add(thirtySeventh, "<+=0.1");
      timeline.add(thirtyEighth, "<+=0.1");
      timeline.add(thirtyNinth, "<+=0.1");
      timeline.add(fourtieth, ">-=0.1");
      timeline.add(fourtyFirst, "<+=0.2");
      timeline.add(fourtySecond, "<+=0.2");
      timeline.add(fourtyThird, "<+=0.2");
      timeline.add(fourtyFourth);
      timeline.add(fourtyFifth);
    });
  };

  const onScroll = (e) => {
    if (e.deltaY > 0) {
      console.log("scrolled");
      /* window.removeEventListener("wheel", onScroll); */
      removeEventListeners();
      playSecondIntro();
    }
  };

  const onTouch = (e) => {
    let initialY = e.touches[0].clientY;
  };

  const onTouchMove = (e) => {
    let currentY = e.touches[0].clientY;
    let difference = initialY - currentY;
    if (difference > 0) {
      console.log(swipped);
      removeEventListeners();
      playSecondIntro();
    }
    initialY = null;
  };

  const removeEventListeners = () => {
    window.removeEventListener("wheel", onScroll);
    /*  window.removeEventListener("touchStart", onTouchStart); */
    /* window.removeEventListener("touchMove", onTouchMove); */
  };

  // fix touch event
  const playFirstIntro = async () => {
    await firstIntro();
    window.addEventListener("wheel", onScroll);
    /* window.addEventListener("touchStart", onTouch);
    window.addEventListener("touchMove", onTouchMove); */
  };

  const playSecondIntro = async () => {
    await secondIntro();
  };

  useEffect(() => {
    if (ready) {
      const actualRoom = room;
      playFirstIntro();

      window.addEventListener("resize", createAnimation);

      function createAnimation() {
        // record state of animation
        const progress = timeline.progress();
        const reversed = timeline.reversed();

        console.log(progress, "progress");

        // clear animation
        /* timeline.progress(0).clear(); */

        // create animation
        timeline
          .to(actualRoom, {})

          // restore state of animation
          .progress(progress);
        /* .reversed(reversed); */
      }
    }
  }, [room]);

  useEffect(() => {
    if (ready) {
      const actualRoom = room;
      const orthographicCamera = camera;

      const raycaster = new THREE.Raycaster();
      const pointer = new THREE.Vector2();

      function onMouseDown(event) {
        event.preventDefault();
        // calculate pointer position in normalized device coordinates
        // (-1 to +1) for both components

        pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
        pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
        console.log(pointer);

        raycaster.setFromCamera(pointer, orthographicCamera);

        // calculate objects intersecting the picking ray
        const intersects = raycaster.intersectObjects(
          actualRoom.children,
          true
        );

        if (intersects.length > 0) {
          let targetObject;

          // Determine the target object
          if (intersects[0].object.parent.name === "Scene") {
            targetObject = intersects[0].object;
          } else {
            targetObject = intersects[0].object.parent;
          }

          console.log(targetObject.name);
          // Check if the clicked object is a valid project
          if (
            !projects.includes(targetObject.name) &&
            targetObject.name !== "Book_Shelf"
          ) {
            console.log("not project");
            return;
          }

          if (
            currentActiveBook
            // &&
            // roomChildren[currentActiveBook] === targetObject
          ) {
            console.log(
              currentActiveBook,
              projectLinks,
              projectLinks[currentActiveBook]
            );

            // Project is active, open its link
            const projectLink = projectLinks[currentActiveBook];
            if (projectLink) {
              window.open(projectLink, "_blank");
            } else {
              console.log("No link found for project:", targetObject.name);
            }
            return;
          }

          // const showProject = new GSAP.timeline();
          // if (
          //   (INTERSECTED == null || INTERSECTED == undefined) &&
          //   INTERSECTED != intersects[0].object
          // ) {
          //   if (intersects[0].object.parent.name === "Scene") {
          //     // if (projects.includes(intersects[0].object.name)) {
          //     INTERSECTED = intersects[0].object;
          //     // }
          //   } else {
          //     // if (projects.includes(intersects[0].object.parent.name)) {
          //     INTERSECTED = intersects[0].object.parent;
          //     // }
          //   }
          //   if (projects.includes(INTERSECTED.name) === false) {
          //     console.log("not project");
          //     INTERSECTED = null;
          //     return;
          //   }

          //   if (
          //     currentActiveBook &&
          //     roomChildren[currentActiveBook] === targetObject
          //   ) {
          //     // Project is active, open its link
          //     const projectLink = projectLinks[targetObject.name];
          //     if (projectLink) {
          //       console.log("Opening project link:", projectLink);
          //       window.open(projectLink, "_blank");
          //     } else {
          //       console.log("No link found for project:", targetObject.name);
          //     }
          //     return;
          //   }

          //   // if (projects.includes(INTERSECTED.name)) {
          //   console.log(INTERSECTED.name);
          //   INTERSECTED_DATA = {
          //     position: {
          //       x: INTERSECTED.position.x,
          //       y: INTERSECTED.position.y,
          //       z: INTERSECTED.position.z,
          //     },
          //     rotation: {
          //       x: INTERSECTED.rotation.x,
          //       y: INTERSECTED.rotation.y,
          //       z: INTERSECTED.rotation.z,
          //     },
          //   };
          //   console.log(INTERSECTED.rotation, "INTERSECTED");

          //   // showProject
          //   //   .to(INTERSECTED.position, {
          //   //     x: INTERSECTED.position.x - 1.5,
          //   //     z: INTERSECTED.position.z + 1.5,
          //   //   })
          //   //   .to(
          //   //     INTERSECTED.rotation,
          //   //     {
          //   //       x: -0.525,
          //   //       y: -1.58,
          //   //     },
          //   //     "same"
          //   //   )
          //   //   .to(
          //   //     INTERSECTED.position,
          //   //     {
          //   //       x: 13.5,
          //   //       y: 11.5,
          //   //       z: 10,
          //   //     },
          //   //     "same"
          //   //   )
          //   //   .to(
          //   //     INTERSECTED.scale,
          //   //     {
          //   //       x: 5,
          //   //       y: 5,
          //   //       z: 5,
          //   //     },
          //   //     "same"
          //   //   );
          //   // }
          // } else {
          //   // if (projects.includes(INTERSECTED.name)) {
          //   // showProject
          //   //   .to(
          //   //     INTERSECTED.rotation,
          //   //     {
          //   //       x: INTERSECTED_DATA.rotation.x,
          //   //       y: INTERSECTED_DATA.rotation.y,
          //   //     },
          //   //     "same"
          //   //   )
          //   //   .to(
          //   //     INTERSECTED.position,
          //   //     {
          //   //       x: INTERSECTED_DATA.position.x - 1.5,
          //   //       y: INTERSECTED_DATA.position.y,
          //   //       z: INTERSECTED_DATA.position.z + 1.5,
          //   //     },
          //   //     "same"
          //   //   )
          //   //   .to(
          //   //     INTERSECTED.scale,
          //   //     {
          //   //       x: 1,
          //   //       y: 1,
          //   //       z: 1,
          //   //     },
          //   //     "same"
          //   //   )
          //   //   .to(INTERSECTED.position, {
          //   //     x: INTERSECTED_DATA.position.x,

          //   //     z: INTERSECTED_DATA.position.z,
          //   //   });
          //   INTERSECTED = null;
          //   // }
          // }
        } else {
          // if (INTERSECTED)
          // INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex);
        }

        let roomItem;
      }
      window.addEventListener("mousedown", onMouseDown);
    }
  }, [room, currentActiveBook]);

  useEffect(() => {
    if (ready) {
      const actualRoom = room;
      const orthographicCamera = camera;

      GSAP.registerPlugin(ScrollTrigger);

      ScrollTrigger.matchMedia({
        // Desktop
        "(min-width: 969px)": () => {
          /* actualRoom.scale.set(0, 0, 0); */
          roomChildren.wall.scale.set(1, 1, 1);
          roomChildren.cube.scale.set(1, 1, 1);
          roomChildren.false_wall.scale.set(1, 1, 1);
          roomChildren.floor.scale.set(1, 1, 1);
          roomChildren.planeFloor.position.y = 0.95;
          //roomChildren.monitorLight.width = 0.724;
          //roomChildren.monitorLight.height = 0.3515;
          //roomChildren.tankLight.width = 0.5;
          //roomChildren.tankLight.height = 1.015;
          //roomChildren.lampLight.width = 0.1;
          //roomChildren.lampLight.height = 0.1;

          // First Section
          const firstMoveTimeline = new GSAP.timeline({
            scrollTrigger: {
              trigger: ".first-margin",
              // markers: true,
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
              // markers: true,
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
          //  roomChildren.monitorLight,
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
              // markers: true,
              start: "top top",
              end: "bottom bottom",
              scrub: 0.6,
              invalidateOnRefresh: true,
            },
          }).to(orthographicCamera.position, {
            x: 4,
            y: 3.5,
          });

          console.log(roomChildren.book_shelf.position, "shelf");

          // Fourth Section
          const fourthMoveTimeline = new GSAP.timeline({
            scrollTrigger: {
              trigger: ".fourth-margin",
              // markers: true,
              start: "top top",
              end: "bottom bottom",
              scrub: 0.6,
              invalidateOnRefresh: true,
            },
          }).to(orthographicCamera.position, {
            x: 2,
            y: 9.2,
          });

          // Fifth Section
          const fifthMoveTimeline = new GSAP.timeline({
            scrollTrigger: {
              trigger: ".fifth-margin",
              // markers: true,
              start: "top top",
              end: "bottom bottom",
              scrub: 0.6,
              invalidateOnRefresh: true,
            },
          }).to(orthographicCamera.position, {
            x: -3.5,
            y: -2.3,
          });

          // Sixth Section
          const sixthMoveTimeline = new GSAP.timeline({
            scrollTrigger: {
              trigger: ".sixth-margin",
              // markers: true,
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
            //  roomChildren.monitorLight,
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
        // touch up camera positioning on the third to fifth sections
        "(max-width: 968px)": () => {
          // Room in mobile
          /* actualRoom.scale.set(0.07, 0.0, 0.0); */
          /* roomChildren.wall.scale.set(0.4, 0.4, 0.4);
          roomChildren.cube.scale.set(0.6364, 0.6364, 0.6364);
          roomChildren.floor.scale.set(0.6364, 0.6364, 0.6364); */
          /* actualRoom.scale.set(0.07, 0.07, 0.07); */
          roomChildren.wall.scale.set(1, 1, 1);
          roomChildren.false_wall.scale.set(1, 1, 1);
          roomChildren.cube.scale.set(1, 1, 1);
          roomChildren.floor.scale.set(1, 1, 1);
          roomChildren.planeFloor.position.y = -0.1;
          actualRoom.position.set(-0.05, 0, -1.7);
          //roomChildren.monitorLight.width = 0.4607;
          //roomChildren.monitorLight.height = 0.2237;
          //roomChildren.tankLight.width = 0.3181;
          //roomChildren.tankLight.height = 0.6459;
          //roomChildren.lampLight.width = 0.0636;
          //roomChildren.lampLight.height = 0.0636;

          // First Section
          const firstMoveTimeline = new GSAP.timeline({
            scrollTrigger: {
              trigger: ".first-margin",
              // markers: true,
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
              onComplete: () => {
                console.log("mobile test");
              },
            },
            "same"
          );

          // Second Section
          const secondMoveTimeline = new GSAP.timeline({
            scrollTrigger: {
              trigger: ".second-margin",
              // markers: true,
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
          //  roomChildren.monitorLight,
          //  {
          //    width: 0.724 * 3.4,
          //    height: 0.3515 * 3.4,
          //  },
          //  "same"
          //);

          // Fourth Section
          const fourthMoveTimeline = new GSAP.timeline({
            scrollTrigger: {
              trigger: ".fourth-margin",
              // markers: true,
              start: "top top",
              end: "bottom bottom",
              scrub: 0.6,
              invalidateOnRefresh: true,
            },
          }).to(orthographicCamera.position, {
            x: 3.56,
            y: 6.5,
          });

          // Fifth Section
          const fifthMoveTimeline = new GSAP.timeline({
            scrollTrigger: {
              trigger: ".fifth-margin",
              // markers: true,
              start: "top top",
              end: "bottom bottom",
              scrub: 0.6,
              invalidateOnRefresh: true,
            },
          }).to(orthographicCamera.position, {
            x: -0.02,
            y: -0.55,
          });

          // Sixth Section
          const sixthMoveTimeline = new GSAP.timeline({
            scrollTrigger: {
              trigger: ".sixth-margin",
              // markers: true,
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
            //  roomChildren.monitorLight,
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

          /* playIntro(); */

          // Mini platform animation
          const secondPartTimeline = new GSAP.timeline({
            scrollTrigger: {
              trigger: ".fourth-margin",
              // markers: true,
              start: "center center",
            },
          });

          /* let first;
          let second;
          let third;
          let fourth;
          let fifth;
          let sixth;
          let seventh;
          let eigth;
          let ninth; */

          const first = GSAP.to(roomChildren.floor.position, {
            x: 3.07688,
            z: 2.66616,
            ease: "back.out(2)",
            duration: 0.3,
          });

          const second = GSAP.to(roomChildren.mailbox.scale, {
            x: 1,
            y: 1,
            z: 1,
            ease: "back.out(2)",
            duration: 0.3,
          });

          const third = GSAP.to(roomChildren.lamp.scale, {
            x: 1,
            y: 1,
            z: 1,
            ease: "back.out(2)",
            duration: 0.3,
          });

          const fourth = GSAP.to(roomChildren.floor_pad001.scale, {
            x: 1,
            y: 1,
            z: 1,
            ease: "back.out(2)",
            duration: 0.3,
          });

          const fifth = GSAP.to(roomChildren.floor_pad002.scale, {
            x: 1,
            y: 1,
            z: 1,
            ease: "back.out(2)",
            duration: 0.3,
          });

          const sixth = GSAP.to(roomChildren.floor_pad003.scale, {
            x: 1,
            y: 1,
            z: 1,
            ease: "back.out(2)",
            duration: 0.3,
          });

          const seventh = GSAP.to(roomChildren.flower_pad.scale, {
            x: 1,
            y: 1,
            z: 1,
            ease: "back.out(2)",
            duration: 0.3,
          });

          const eigth = GSAP.to(roomChildren.flower001.scale, {
            x: 1,
            y: 1,
            z: 1,
            ease: "back.out(2)",
            duration: 0.3,
          });

          const ninth = GSAP.to(roomChildren.flower002.scale, {
            x: 1,
            y: 1,
            z: 1,
            ease: "back.out(2)",
            duration: 0.3,
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

          // First Section
          const firstMoveTimeline = new GSAP.timeline({
            scrollTrigger: {
              trigger: ".first-margin",
              // markers: true,
              start: "top top",
              end: "bottom bottom",
              scrub: 0.6,
              invalidateOnRefresh: true,
            },
          }).to(circleFirst.scale, {
            x: 3,
            y: 3,
            z: 3,
          });

          // Second Section
          const secondMoveTimeline = new GSAP.timeline({
            scrollTrigger: {
              trigger: ".second-margin",
              // markers: true,
              start: "top top",
              end: "bottom bottom",
              scrub: 0.6,
              invalidateOnRefresh: true,
            },
          })
            .to(
              circleSecond.scale,
              {
                x: 3,
                y: 3,
                z: 3,
              },
              "same"
            )
            .to(
              actualRoom.position,
              {
                y: 0.7,
              },
              "same"
            )
            .to(
              orthographicCamera.position,
              {
                y: 4.7,
              },
              "same"
            );

          // Fourth Section
          const fourthMoveTimeline = new GSAP.timeline({
            scrollTrigger: {
              trigger: ".fourth-margin",
              // markers: true,
              start: "top top",
              end: "bottom bottom",
              scrub: 0.6,
              invalidateOnRefresh: true,
            },
          }).to(circleThird.scale, {
            x: 3,
            y: 3,
            z: 3,
          });

          // Fifth Section
          const fifthMoveTimeline = new GSAP.timeline({
            scrollTrigger: {
              trigger: ".fifth-margin",
              // markers: true,
              start: "top top",
              end: "bottom bottom",
              scrub: 0.6,
              invalidateOnRefresh: true,
            },
          }).to(actualRoom.position, {
            y: 0,
          });

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
                  // markers: true,
                },
              });
              GSAP.to(section, {
                borderBottomLeftRadius: 700,
                scrollTrigger: {
                  trigger: section,
                  start: "bottom bottom",
                  end: "bottom top",
                  scrub: 0.6,
                  // markers: true,
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
                  // markers: true,
                },
              });
              GSAP.to(section, {
                borderBottomRightRadius: 700,
                scrollTrigger: {
                  trigger: section,
                  start: "bottom bottom",
                  end: "bottom top",
                  scrub: 0.6,
                  // markers: true,
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
