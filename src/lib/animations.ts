import { gsap } from 'gsap';
// Type imports will be used when needed

/**
 * Animation for the gate opening sequence
 */
export const animateGateOpen = (element: HTMLElement | null) => {
  if (!element) return;
  
  const tl = gsap.timeline({ defaults: { ease: 'power2.inOut' } });
  
  tl.fromTo(
    element,
    { scale: 0.95, opacity: 0, y: 20 },
    { 
      scale: 1, 
      opacity: 1, 
      y: 0,
      duration: 0.3,
      ease: 'back.out(1.4)'
    }
  );
  
  // Add a subtle pulse effect
  tl.to(element, {
    scale: 1.02,
    yoyo: true,
    repeat: 1,
    duration: 0.2,
    ease: 'sine.inOut'
  }, '+=0.1');
  
  return tl;
};

/**
 * Animation for the ticket modal entrance
 */
export const animateTicketModalIn = (element: HTMLElement | null) => {
  if (!element) return;
  
  const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
  
  // Initial state
  gsap.set(element, { scale: 0.9, opacity: 0, y: 20 });
  
  // Animate in
  tl.to(element, {
    scale: 1,
    opacity: 1,
    y: 0,
    duration: 0.3,
    ease: 'back.out(1.4)'
  });
  
  return tl;
};

/**
 * Animation for the ticket modal exit
 */
export const animateTicketModalOut = (element: HTMLElement | null) => {
  if (!element) return;
  
  const tl = gsap.timeline({ defaults: { ease: 'power2.in' } });
  
  tl.to(element, {
    scale: 0.95,
    opacity: 0,
    y: 10,
    duration: 0.2
  });
  
  return tl;
};

/**
 * Animation for zone selection
 */
export const animateZoneSelect = (element: HTMLElement | null, isSelected: boolean) => {
  if (!element) return;
  
  if (isSelected) {
    return gsap.to(element, {
      y: -2,
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      duration: 0.2,
      ease: 'power2.out'
    });
  } else {
    return gsap.to(element, {
      y: 0,
      boxShadow: 'none',
      duration: 0.2,
      ease: 'power2.in'
    });
  }
};

/**
 * Animation for form submission
 */
export const animateFormSubmit = (element: HTMLElement | null) => {
  if (!element) return;
  
  const tl = gsap.timeline({ defaults: { ease: 'power2.inOut' } });
  
  tl.to(element, {
    scale: 0.98,
    duration: 0.1
  });
  
  tl.to(element, {
    scale: 1,
    duration: 0.3,
    ease: 'elastic.out(1, 0.5)'
  });
  
  return tl;
};

/**
 * Animation for connection status changes
 */
export const animateConnectionStatus = (element: HTMLElement | null) => {
  if (!element) return;
  
  const tl = gsap.timeline();
  
  tl.to(element, {
    scale: 1.2,
    duration: 0.15,
    ease: 'power2.out'
  });
  
  tl.to(element, {
    scale: 1,
    duration: 0.3,
    ease: 'elastic.out(1, 0.5)'
  });
  
  return tl;
};

/**
 * Animation for loading state
 */
export const animateLoadingPulse = (element: HTMLElement | null) => {
  if (!element) return;
  
  return gsap.to(element, {
    opacity: 0.6,
    duration: 1,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut'
  });
};

/**
 * Animation for error message
 */
export const animateErrorShake = (element: HTMLElement | null) => {
  if (!element) return;
  
  const tl = gsap.timeline();
  
  tl.to(element, {
    x: 5,
    duration: 0.05
  });
  
  tl.to(element, {
    x: -5,
    duration: 0.1
  });
  
  tl.to(element, {
    x: 0,
    duration: 0.05
  });
  
  return tl;
};

/**
 * Animation for tab switching
 */
export const animateTabSwitch = (activeTab: HTMLElement | null, direction: 'left' | 'right') => {
  if (!activeTab) return;
  
  const tl = gsap.timeline({ defaults: { ease: 'power2.inOut' } });
  
  // Initial state
  gsap.set(activeTab, {
    x: direction === 'right' ? 20 : -20,
    opacity: 0
  });
  
  // Animate in
  tl.to(activeTab, {
    x: 0,
    opacity: 1,
    duration: 0.3
  });
  
  return tl;
};

/**
 * Animation for printing ticket
 */
export const animatePrintTicket = (element: HTMLElement | null) => {
  if (!element) return;
  
  const tl = gsap.timeline();
  
  tl.to(element, {
    scale: 0.98,
    duration: 0.1
  });
  
  tl.to(element, {
    scale: 1,
    duration: 0.3,
    ease: 'elastic.out(1, 0.5)'
  });
  
  return tl;
};
