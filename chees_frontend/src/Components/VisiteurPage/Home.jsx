import React, { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import logo from './rci-logo.jpg';
import './Home.css';
import InfiniteScrollCards from './InfiniteScrollCards';
import founderImage from './chess-icons/founder.png';
import asma from './chess-icons/asma.jpg';
import zack from './chess-icons/zack.jpg';
import romrom from './chess-icons/romrom.jpg';
// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

const Home = () => {
  // Create refs for all sections and logo
  const homeContainerRef = useRef(null);
  const section1Ref = useRef(null);
  const section2Ref = useRef(null);
  const section3Ref = useRef(null);
  const section4Ref = useRef(null);
  const logoRef = useRef(null);
  
useEffect(() => {
  // Clear any existing ScrollTrigger instances
  ScrollTrigger.getAll().forEach(trigger => trigger.kill());
  
  // Responsive logo positions based on screen width
  const getLogoPositions = () => {
    // Default positions for large screens 
    const defaultPositions = [
      { left: 50, top: 50, size: 300, scale: 1.2 },     // Section 1: Center
      { left: 20, top: 40, size: 250, scale: 0.92 },    // Section 2: Left side and higher
      { left: 80, top: 50, size: 250, scale: 0.92 },    // Section 3: Right side
      { left: 50, top: 90, size: 200, scale: 0.4 }      // Section 4: Center again, but smaller
    ];
    
    
    // For medium screens (1200px - 1440px)
   if (window.innerWidth <= 1440 && window.innerWidth > 1200) {
      return [
        { left: 50, top: 47, size: 290, scale: 1.1 },
        { left: 25, top: 40, size: 230, scale: 0.9 },
        { left: 85, top: 50, size: 230, scale: 0.9 },
        { left: 50, top: 90, size: 180, scale: 0.5 }
      ];
    }
    // For smaller screens (992px - 1200px)
    else if (window.innerWidth <= 1200 && window.innerWidth > 992) {
      return [
        { left: 50, top: 50, size: 240, scale: 1 },
        { left: 30, top: 40, size: 200, scale: 0.85 },
        { left: 70, top: 50, size: 200, scale: 0.85 },
        { left: 50, top: 80, size: 160, scale: 0.5 }
      ];
    }
    // For tablets (768px - 992px)
    else if (window.innerWidth <= 992 && window.innerWidth > 768) {
      return [
        { left: 50, top: 50, size: 200, scale: 0.9 },
        { left: 35, top: 40, size: 180, scale: 0.8 },
        { left: 65, top: 50, size: 180, scale: 0.8 },
        { left: 50, top: 75, size: 140, scale: 0.5 }
      ];
    }
    // For mobile landscape (576px - 768px)
    else if (window.innerWidth <= 768 && window.innerWidth > 576) {
      return [
        { left: 50, top: 50, size: 180, scale: 0.85 },
        { left: 50, top: 30, size: 160, scale: 0.75 }, // Centered for mobile
        { left: 50, top: 50, size: 160, scale: 0.75 }, // Centered for mobile
        { left: 50, top: 70, size: 120, scale: 0.5 }
      ];
    }
    // For mobile portrait (< 576px)
    else if (window.innerWidth <= 576) {
      return [
        { left: 50, top: 50, size: 150, scale: 0.8 },
        { left: 50, top: 25, size: 130, scale: 0.7 }, // Centered for mobile
        { left: 50, top: 50, size: 130, scale: 0.7 }, // Centered for mobile
        { left: 50, top: 65, size: 100, scale: 0.5 }
      ];
    }
    
    return defaultPositions;
  };
  
  // Get responsive logo positions
  const logoPositions = getLogoPositions();
  
  // Set initial logo properties
  if (logoRef.current) {
    gsap.set(logoRef.current, {
      xPercent: -50,
      yPercent: -50,
      left: `${logoPositions[0].left}%`,
      top: `${logoPositions[0].top}%`,
      width: logoPositions[0].size,
      height: logoPositions[0].size,
      scale: logoPositions[0].scale,
      force3D: true // Hardware acceleration
    });
  }
  
  // Create sections array
  const sections = [section1Ref.current, section2Ref.current, section3Ref.current, section4Ref.current];
  
  // Create the primary scroll-based animation for ultra-smooth transitions
  const mainTimeline = gsap.timeline({
    scrollTrigger: {
      trigger: homeContainerRef.current,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.5, // Lower value for smoother animations
      pin: false, // No pinning for continuous scroll
      invalidateOnRefresh: true, // Recalculate on resize
      anticipatePin: 1, // Helps with smoother pin transitions
    }
  });
  
  // Create individual section transitions
  sections.forEach((section, index) => {
    if (!section || index === sections.length - 1) return;
    
    const nextIndex = index + 1;
    const currentPos = logoPositions[index];
    const nextPos = logoPositions[nextIndex];
    
    // Calculate the duration based on section height relative to window height
    const sectionHeight = section.offsetHeight;
    const windowHeight = window.innerHeight;
    const scrollDuration = sectionHeight / windowHeight;
    
    // Create a transition for this section
    mainTimeline.to(logoRef.current, {
      left: `${nextPos.left}%`,
      top: `${nextPos.top}%`,
      width: nextPos.size,
      height: nextPos.size,
      scale: nextPos.scale,
      ease: "power1.inOut",
      duration: scrollDuration,
    }, `section${index}`);
    
    // Mark the position in the timeline for sequencing
    if (index < sections.length - 1) {
      mainTimeline.addLabel(`section${nextIndex}`, `section${index}+=${scrollDuration}`);
    }
  });
  
  // Section-specific animation adjustments based on screen size
  const isMobile = window.innerWidth <= 768;
  const isTablet = window.innerWidth <= 992 && window.innerWidth > 768;
  const isSmallScreen = window.innerWidth <= 1366 && window.innerWidth > 992;
  
  // Section 1 animations
  gsap.timeline({
    scrollTrigger: {
      trigger: section1Ref.current,
      start: 'top bottom',
      end: 'center center',
      scrub: true,
    }
  })
  .fromTo(section1Ref.current.querySelector('h1'), 
    { opacity: 0, y: isMobile ? 50 : isSmallScreen ? 70 : 100 },
    { opacity: 1, y: 0, duration: isMobile ? 0.3 : isSmallScreen ? 0.4 : 0.5 }
  )
  .fromTo(section1Ref.current.querySelector('p'),
    { opacity: 0, y: isMobile ? 30 : isSmallScreen ? 40 : 50 },
    { opacity: 1, y: 0, duration: isMobile ? 0.3 : isSmallScreen ? 0.4 : 0.5 },
    '-=0.3'
  );
  
  // Section 2 animations
  gsap.timeline({
    scrollTrigger: {
      trigger: section2Ref.current,
      start: 'top bottom',
      end: 'center center',
      scrub: true,
    }
  })
  .fromTo(section2Ref.current.querySelectorAll('p'),
    { opacity: 0, x: isMobile ? -50 : isSmallScreen ? -75 : -100 },
    { opacity: 1, x: 0, stagger: isMobile ? 0.1 : isSmallScreen ? 0.15 : 0.2, duration: isMobile ? 0.3 : isSmallScreen ? 0.4 : 0.5 }
  )
  .fromTo(section2Ref.current.querySelector('.about-us-header'),
    { opacity: 0, y: isMobile ? 20 : isSmallScreen ? 25 : 30 },
    { opacity: 1, y: 0, duration: isMobile ? 0.2 : isSmallScreen ? 0.25 : 0.3 },
    '-=0.2'
  )
  .fromTo(section2Ref.current.querySelector('.infinite-scroll-container'),
    { opacity: 0, y: isMobile ? 20 : isSmallScreen ? 25 : 30 },
    { opacity: 1, y: 0, duration: isMobile ? 0.3 : isSmallScreen ? 0.4 : 0.5 },
    '-=0.1'
  );
  
  // Section 3 animations with responsive adjustments
  gsap.timeline({
    scrollTrigger: {
      trigger: section3Ref.current,
      start: 'top bottom',
      end: 'center center',
      scrub: true,
    }
  })
  .fromTo(section3Ref.current.querySelectorAll('.content-item'),
    { opacity: 0, y: isMobile ? 30 : isSmallScreen ? 40 : 50 },
    { opacity: 1, y: 0, stagger: isMobile ? 0.1 : isSmallScreen ? 0.15 : 0.2, duration: isMobile ? 0.3 : isSmallScreen ? 0.4 : 0.5 }
  );
  
  // Section 4 animations - modified to ensure animation appears below join button
  gsap.timeline({
    scrollTrigger: {
      trigger: section4Ref.current,
      start: 'top bottom',
      end: 'center center',
      scrub: true,
    }
  })
  .fromTo(section4Ref.current.querySelectorAll('.player-showcase'),
    { opacity: 0, scale: isMobile ? 0.85 : isSmallScreen ? 0.9 : 0.8 },
    { opacity: 1, scale: 1, stagger: isMobile ? 0.1 : isSmallScreen ? 0.15 : 0.2, duration: isMobile ? 0.3 : isSmallScreen ? 0.4 : 0.5 }
  )
  .fromTo(section4Ref.current.querySelector('.cta'),
    { opacity: 0, y: isMobile ? 30 : isSmallScreen ? 40 : 50 },
    { opacity: 1, y: 0, duration: isMobile ? 0.3 : isSmallScreen ? 0.4 : 0.5 },
    '-=0.3'
  );
  
  // Add a subtle floating animation to the logo for more visual interest
  // Smaller movement for smaller screens
  const floatDistance = isMobile ? 5 : isTablet ? 7 : isSmallScreen ? 8 : 10;
  gsap.to(logoRef.current, {
    y: floatDistance,
    duration: isMobile ? 1.5 : isSmallScreen ? 1.8 : 2,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut"
  });
  
  // Responsive shadow effect function
const updateLogoEffect = () => {
  if (!logoRef.current) return;
  
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const docHeight = Math.max(
    document.body.scrollHeight,
    document.documentElement.scrollHeight,
    document.body.offsetHeight,
    document.documentElement.offsetHeight
  );
  
  // Calculate scroll progress (0 to 1)
  const scrollProgress = scrollTop / (docHeight - window.innerHeight);
  
  // Determine current section
  let currentSection = 0;
  if (scrollProgress > 0.25 && scrollProgress <= 0.5) currentSection = 1;
  else if (scrollProgress > 0.5 && scrollProgress <= 0.75) currentSection = 2;
  else if (scrollProgress > 0.75) currentSection = 3;
  
  // Shadow colors for each section
  const shadowColors = [
    'rgba(26, 60, 94, 0.5)',      // Section 1: Blue shade
    'rgba(233, 224, 209, 0.5)',    // Section 2: Beige shade
    'rgba(141, 169, 196, 0.5)',    // Section 3: Light blue shade
    'rgba(255, 255, 255, 0.5)'     // Section 4: White shade
  ];
  
  // Get the logo image element
  const logoImg = logoRef.current.querySelector('img');
  
  // Apply filter-based shadow instead of box-shadow
  const shadowColor = shadowColors[currentSection];
  const intensity = isMobile ? '5px' : isTablet ? '8px' : isSmallScreen ? '10px' : '12px';
  
  // Use drop-shadow filter which follows the alpha channel of the image
  gsap.to(logoImg, {
    filter: `drop-shadow(0 0 ${intensity} ${shadowColor})`,
    duration: 0.5,
    ease: "power1.out"
  });
};
  
  // Handle window resize for responsive animations
  const handleResize = () => {
    // Force ScrollTrigger to recalculate
    ScrollTrigger.refresh(true);
    
    // Update logo positions based on new screen size
    const newLogoPositions = getLogoPositions();
    const currentSection = getCurrentSection();
    
    if (logoRef.current) {
      gsap.to(logoRef.current, {
        left: `${newLogoPositions[currentSection].left}%`,
        top: `${newLogoPositions[currentSection].top}%`,
        width: newLogoPositions[currentSection].size,
        height: newLogoPositions[currentSection].size,
        scale: newLogoPositions[currentSection].scale,
        duration: 0.3,
      });
    }
    
    // Update logo effect
    updateLogoEffect();
  };
  
  // Helper function to determine current section
  const getCurrentSection = () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const docHeight = Math.max(
      document.body.scrollHeight, 
      document.documentElement.scrollHeight,
      document.body.offsetHeight, 
      document.documentElement.offsetHeight
    );
    
    const scrollProgress = scrollTop / (docHeight - window.innerHeight);
    
    if (scrollProgress <= 0.25) return 0;
    if (scrollProgress <= 0.5) return 1;
    if (scrollProgress <= 0.75) return 2;
    return 3;
  };
  
  // Add a scroll listener for real-time adjustments
  window.addEventListener('scroll', updateLogoEffect, { passive: true });
  
  // Add resize listener
  window.addEventListener('resize', handleResize, { passive: true });
  
  // Initial call
  updateLogoEffect();
  
  // Cleanup function
  return () => {
    ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    window.removeEventListener('scroll', updateLogoEffect);
    window.removeEventListener('resize', handleResize);
    gsap.killTweensOf(logoRef.current);
  };
}, []);
  
  return (
    <div className="home-container" ref={homeContainerRef}>
      {/* Logo that follows scroll - now with floating animation and keeps upright */}
      
      <div className="logo-container" ref={logoRef}>
        <img src={logo} alt="RCI Chess Club Logo" />
      </div>

      {/* First Section - Header */}
      <section className="section section-1" ref={section1Ref}>
        <div className="call-to-action cta">
          <Link to="/login">
            <button className="cta-login-button">Login</button>
          </Link>
        </div>
        <h1 className="header">Welcome to Raja Club Inzegane of Chess</h1>
        <p className="paragraph">
          Experience the royal game of chess at its finest
        </p>
        <div className="spacer"></div>
      </section>

      {/* Second Section - About the club paragraph */}
      <section className="section section-2" ref={section2Ref}>
        <div className="right-aligned-content">
          <div className="main-content-wrapper">
            <div className="about-us-container" >
              <h2 className="about-us-header">About Us</h2>
              <p className="paragraph">
                Raja Club Inzegane of Chess is a prestigious chess club founded with the vision
                of promoting the royal game of chess across all age groups and skill levels.
                Our club brings together chess enthusiasts, from beginners to masters,
                creating a vibrant community where knowledge is shared, skills are honed,
                and friendships are formed. Through regular tournaments, coaching sessions,
                and social events, we provide a comprehensive platform for chess development
                while fostering a love for the game's rich tradition and strategic depth.
              </p>
            </div>
          </div>
        </div>
        <InfiniteScrollCards />
        
        <div className="spacer"></div>
      </section>

      {/* Third Section - Founder's image and bio */}
      <section className="section section-3" ref={section3Ref}>
        <div className="left-aligned-content">
          <div className="main-content-wrapper">
            <div className="image-wrapper">
              <img src={founderImage} alt="Founder" />
            </div>
            <div className="content-item">
              <h2 className="about-us-header">Our Founder</h2>
              <p className="paragraph paragraph-left">
                Ahmed Touktah, International Chess Master and renowned chess educator, founded Raja Club Inzegane of Chess
                in 2018 with a mission to democratize chess education. With over 10 years of competitive chess experience
                and a passion for teaching, he has developed innovative methodologies that make chess accessible to
                players of all backgrounds. His vision has transformed RCI into one of the most respected chess
                institutions, known for producing champions while maintaining an inclusive, supportive community.
              </p>
            </div>
          </div>
        </div>
        <div className="spacer"></div>
      </section>

      {/* Fourth Section - Player showcases and call to action */}
      <section className="section section-4" ref={section4Ref}>
        <h2 className="about-us-header player-header">Our Distinguished Players</h2>
        <div className="main-content-wrapper player-wrapper">
          <div className="player-showcase">
            <img src={zack} alt="Player 1" />
            <h3>Zakaria Belayd</h3>
            <p>Best Player in Club</p>
            <p>2nd place in the national championship 2022 in classical chess</p>
            <small>Joined RCI in 2018 and rose to prominence with an innovative approach to opening theory.</small>
          </div>
          
          <div className="player-showcase">
            <img src={asma} alt="asma" />
            <h3>Asma Miguadern</h3>
            <p>National Moroccan Team Player</p>
            <p>Marrakesh-Asfi region Champion 2025 in rapid and blitz chess</p>
            <small>RCI's most decorated female player with a distinctive positional style and endgame mastery.</small>
          </div>
          
          <div className="player-showcase">
            <img src={romrom} alt="rom" />
            <h3>Romaysa Fegro</h3>
            <p>youngest champion in the club</p>
            <p>1st place in the national championship 2022 in classical chess for females under 8 </p>
            <small>Trained at RCI since age 5, known for her tactical brilliance and aggressive play style.</small>
          </div>
        </div>
        
        <div className="call-to-action cta join">
          <h2>Want to be one of them? Join now!</h2>
          <Link to="/register">
            <button>Become a Member</button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;