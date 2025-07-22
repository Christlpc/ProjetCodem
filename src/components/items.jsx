//src/constants/items.js
import React from 'react';
/*import {
  Weekend,              // canapé
  Bed,                  // lit
  ChairAlt,             // chaise/fauteuil
  TableBar,             // table
  Tv,                   // tv
  Kitchen,              // frigo
  LocalLaundryService,  // lave-linge
  Book,                 // bibliothèque/armoire
  Desk,                 // bureau/console
  Inventory2,           // commode
  StoreMallDirectory,   // étagère
  Light,                // lampe
  AcUnit,               // clim / ventilateur
  Restaurant,           // vaisselle
  Bathtub,              // baignoire
} from '@mui/icons-material';*/

// ✅ Import du fichier SVG comme composant React
import { ReactComponent as CanapeSvg } from './items/canapé.svg';
import { ReactComponent as FauteuilSvg } from './items/fauteuil.svg';
import canapeImg from './items/bed (1).png';
import tableImg from './items/dining-table.png';
import tvImg from './items/tv.svg';
import biblioImg from './items/biblio.svg';
import commodeImg from './items/tablelit.svg';
import chairImg from './items/chaise.svg';
import fridgeImg from './items/fridge.png';
import etagereImg from './items/6038033_bedside table_book_bookshelf_furnitures_house_icon.svg';
import washingMImg from './items/washing-machine.png';
import climImg from './items/clim.png';
import baignoireImg from './items/Baignoire.svg';
import vaisselleImg from './items/vaiselle.jpg';
import bureauImg from './items/bureau.png';
import lampeImg from './items/lampe.png';

export const ITEMS = [
  { name: 'canape',    label: 'Canapé',            category: 'Salon',     icon: <CanapeSvg style={{ width: 50, height: 50 }} /> },
  { name: 'lit',       label: 'Lit double',        category: 'Chambre',   icon: <img src={canapeImg} style={{ width: 50, height: 50 }} /> },
  { name: 'fauteuil',  label: 'Fauteuil',          category: 'Salon',     icon: <FauteuilSvg style={{ width: 50, height: 50 }} /> },
  { name: 'table',     label: 'Table à manger',    category: 'Cuisine',   icon: <img src={tableImg} style={{ width: 50, height: 50 }} /> },
  { name: 'chaise',    label: 'Chaise',            category: 'Cuisine',   icon: <img src={chairImg} style={{ width: 50, height: 50 }} /> },
  { name: 'tv',        label: 'Télévision',        category: 'Salon',     icon: <img src={tvImg} style={{ width: 50, height: 50 }} /> },
  { name: 'frigo',     label: 'Réfrigérateur',     category: 'Cuisine',   icon: <img src={fridgeImg} style={{ width: 50, height: 50 }} /> },
  { name: 'laveLinge', label: 'Lave-linge',        category: 'Buanderie', icon: <img src={washingMImg} style={{ width: 50, height: 50 }} /> },
  { name: 'armoire',   label: 'Armoire / bibliothèque', category: 'Chambre', icon: <img src={biblioImg} style={{ width: 50, height: 50 }} /> },
  { name: 'bureau',    label: 'Bureau',            category: 'Bureau',    icon: <img src={bureauImg} style={{ width: 50, height: 50 }} /> },
  { name: 'commode',   label: 'Commode',           category: 'Chambre',   icon: <img src={commodeImg} style={{ width: 50, height: 50 }} /> },
  { name: 'etagere',   label: 'Étagère',           category: 'Salon',     icon: <img src={etagereImg} style={{ width: 50, height: 50 }} /> },
  { name: 'lampe',     label: 'Lampe',             category: 'Tous',      icon: <img src={lampeImg} style={{ width: 90, height: 50 }} /> },
  { name: 'ventilo',   label: 'Climatiseur / Ventilateur', category: 'Tous', icon: <img src={climImg} style={{ width: 50, height: 50 }} /> },
  { name: 'vaisselle', label: 'Service vaisselle', category: 'Cuisine',   icon: <img src={vaisselleImg} style={{ width: 50, height: 50 }} /> },
  { name: 'baignoire', label: 'Baignoire',         category: 'Salle de bain', icon: <img src={baignoireImg} style={{ width: 50, height: 50 }} />},
];