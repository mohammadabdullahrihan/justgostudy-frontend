import { useInView } from '../../hooks/useInView';

const ScrollReveal = ({
  children,
  className = '',
  delay = 0,
  direction = 'up',
  duration = 600
}) => {
  const { ref, isInView } = useInView({ threshold: 0.2, triggerOnce: true });

  const getTransform = () => {
    switch (direction) {
      case 'up': return 'translateY(30px)';
      case 'down': return 'translateY(-30px)';
      case 'left': return 'translateX(30px)';
      case 'right': return 'translateX(-30px)';
      default: return 'translateY(30px)';
    }
  };

  const styles = {
    opacity: isInView ? 1 : 0,
    transform: isInView ? 'translate(0)' : getTransform(),
    transition: `opacity ${duration}ms ease ${delay}ms, transform ${duration}ms ease ${delay}ms`,
    willChange: 'opacity, transform',
  };

  return (
    <div ref={ref} className={className} style={styles}>
      {children}
    </div>
  );
};

export default ScrollReveal;
