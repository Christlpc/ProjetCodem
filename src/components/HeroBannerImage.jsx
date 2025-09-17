import { Box, Button, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import { Link as ScrollLink, Element } from 'react-scroll';
import  Banner  from '../assets/hero.png';


function HeroBannerImage() {
  const theme = useTheme();

  return (
    <Box sx={{ position: 'relative', height: { xs: 300, md: 500 }, width: '100%' }}>
      <img
        src={Banner} // Remplace avec ton image
        alt="Banner Déménagement"
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <Button
            component={ScrollLink}
            to="formulaire-dem"
            smooth
            duration={600}
            offset={-80}
            variant="contained"
            color="primary"
            size="large"
            sx={{
              borderRadius: '50px',
              px: 4,
              py: 1.5,
              fontWeight: 'bold',
              fontSize: '1rem',
              '&:hover': { bgcolor: 'primary.dark' },
            }}
          >
            Demander un déménagement
          </Button>
        </motion.div>
      </Box>
    </Box>
  );
}

export default HeroBannerImage;
