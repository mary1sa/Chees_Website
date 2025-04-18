import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import './InfiniteScrollCards.css';
// Import images directly
import rookImage from './chess-icons/rook.png';
import knightImage from './chess-icons/knight.png';
import kingImage from './chess-icons/king.png';
import clockImage from './chess-icons/clock.png';
import queenImage from './chess-icons/queen.png';
import boardImage from './chess-icons/board.png';
import bishopImage from './chess-icons/bishop.png';
import pawnImage from './chess-icons/pawn.png';

const chessItems = [
  {
    id: 1,
    title: "Chess Openings",
    icon: rookImage
  },
  {
    id: 2,
    title: "Tactical Patterns",
    icon: knightImage
  },
  {
    id: 3,
    title: "Endgame Mastery",
    icon: kingImage
  },
  {
    id: 4,
    title: "Chess History",
    icon: clockImage
  },
  {
    id: 5,
    title: "Tournament Play",
    icon: queenImage
  },
  {
    id: 6,
    title: "Chess Coaching",
    icon: boardImage
  },
  {
    id: 7,
    title: "Chess Technology",
    icon: bishopImage
  },
  {
    id: 8,
    title: "Chess Community",
    icon: pawnImage
  }
];

const InfiniteScrollCards = () => {
  const carouselRef = useRef(null);
  const firstSetRef = useRef(null);
  
  useEffect(() => {
    const carousel = carouselRef.current;
    const firstSet = firstSetRef.current;
    
    if (!carousel || !firstSet) return;
    
    // Wait a moment for DOM to settle
    const initTimer = setTimeout(() => {
      const firstSetWidth = firstSet.offsetWidth;
      
      // Create animation that truly repeats infinitely
      const scrollAnimation = gsap.to(carousel, {
        x: `-=${firstSetWidth}`,
        duration: 25,
        ease: "linear",
        repeat: -1,
        onRepeat: () => {
          // Create the illusion of infinite scrolling by resetting position
          const currentX = gsap.getProperty(carousel, "x");
          if (currentX <= -firstSetWidth) {
            gsap.set(carousel, { x: 0 });
          }
        }
      });
      
      // Pause on hover
      const handleMouseEnter = () => {
        scrollAnimation.pause();
      };
      
      const handleMouseLeave = () => {
        scrollAnimation.play();
      };
      
      carousel.addEventListener('mouseenter', handleMouseEnter);
      carousel.addEventListener('mouseleave', handleMouseLeave);
      
      return () => {
        carousel.removeEventListener('mouseenter', handleMouseEnter);
        carousel.removeEventListener('mouseleave', handleMouseLeave);
        scrollAnimation.kill();
      };
    }, 200);
    
    return () => {
      clearTimeout(initTimer);
      gsap.killTweensOf(carousel);
    };
  }, []);
  
  // Create three sets of cards for reliable infinite scrolling
  return (
    <div className="infinite-scroll-container">
      <div className="carousel-track" ref={carouselRef}>
        {/* First set - keep reference for width calculation */}
        <div ref={firstSetRef} style={{ display: 'flex', gap: '20px' }}>
          {chessItems.map((item) => (
            <div
              key={`set1-${item.id}`}
              className="chess-card"
            >
              <div className="card-icon"><img src={item.icon} alt={item.title} /></div>
              <h3>{item.title}</h3>
            </div>
          ))}
        </div>
        
        {/* Second set */}
        <div style={{ display: 'flex', gap: '20px' }}>
          {chessItems.map((item) => (
            <div
              key={`set2-${item.id}`}
              className="chess-card"
            >
              <div className="card-icon"><img src={item.icon} alt={item.title} /></div>
              <h3>{item.title}</h3>
            </div>
          ))}
        </div>
        
        {/* Third set for extra coverage */}
        <div style={{ display: 'flex', gap: '20px' }}>
          {chessItems.map((item) => (
            <div
              key={`set3-${item.id}`}
              className="chess-card"
            >
              <div className="card-icon"><img src={item.icon} alt={item.title} /></div>
              <h3>{item.title}</h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InfiniteScrollCards;