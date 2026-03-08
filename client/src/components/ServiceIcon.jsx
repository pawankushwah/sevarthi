import { 
  Bike, Car, Zap, Droplet, Wind, Home, Hammer, Pickaxe, Paintbrush, Building, Brush, Briefcase, Wrench
} from 'lucide-react';

export default function ServiceIcon({ name, className = "w-6 h-6" }) {
  const iconMap = {
    'Bike Ride': <Bike className={className} />,
    'Auto': <Car className={className} />,
    'Electrician': <Zap className={className} />,
    'Plumber': <Droplet className={className} />,
    'AC Repair': <Wind className={className} />,
    'Cleaning': <Home className={className} />,
    'Carpenter': <Hammer className={className} />,
    'Mason': <Pickaxe className={className} />,
    'Painter': <Paintbrush className={className} />,
    'Civil Work': <Building className={className} />,
    'Interior Designer': <Brush className={className} />,
  };
  
  return iconMap[name] || <Wrench className={className} />;
}
