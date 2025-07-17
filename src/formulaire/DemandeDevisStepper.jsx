// src/components/DevisStepper.jsx
import React, { useState } from "react";
import {
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Box,
  TextField,
  FormControlLabel,
  Checkbox,
  Badge,
  Container,
  IconButton,
  useTheme,
  Autocomplete,
  MenuItem,
  Paper,
  Grid
} from "@mui/material";
import { Add, Remove } from "@mui/icons-material";
import { useForm, Controller, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import { ITEMS } from "../components/items";

const fallbackItems = [
  { name: "sofa", label: "Canapé", category: "Salon", icon: "🛋️" },
  { name: "bed", label: "Lit", category: "Chambre", icon: "🛏️" },
  { name: "tv", label: "Télévision", category: "Salon", icon: "📺" },
];

const ITEMS_SAFE = ITEMS || fallbackItems;

const schema = yup.object({
  departureAddress: yup.string().required(),
  arrivalAddress: yup.string().required(),
  date: yup.string().required(),
  housingType: yup.string().required(),
  hasFloors: yup.boolean(),
  floor: yup.number().nullable(),
  hasElevator: yup.boolean(),
  volume: yup.string().required(),
  items: yup
    .object(
      ITEMS_SAFE.reduce((acc, item) => {
        acc[item.name] = yup.number().min(0).required();
        return acc;
      }, {})
    )
    .required(),
  fullName: yup.string().required(),
  email: yup.string().email().required(),
  phone: yup.string().required(),
  additionalInfo: yup.string().nullable()
});

const steps = ["Adresses", "Logement", "Objets", "Contact"];

const stepFields = {
  0: ["departureAddress", "arrivalAddress", "date"],
  1: ["housingType", "hasFloors", "floor", "hasElevator", "volume"],
  2: ITEMS_SAFE.map(i => `items.${i.name}`),
  3: ["fullName", "email", "phone"]
};

export default function DevisStepper() {
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const [search, setSearch] = useState("");

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      departureAddress: "",
      arrivalAddress: "",
      date: "",
      housingType: "",
      hasFloors: false,
      floor: null,
      hasElevator: false,
      volume: "",
      items: ITEMS_SAFE.reduce((acc, i) => ({ ...acc, [i.name]: 0 }), {}),
      fullName: "",
      email: "",
      phone: "",
      additionalInfo: ""
    }
  });

  const { control, handleSubmit, setValue, getValues, trigger, watch } = methods;
  const hasFloors = watch("hasFloors");

  const onSubmit = async (data) => {
    await axios.post("/api/devis/submit", data);
    alert("Demande envoyée 😊");
    setActiveStep(0);
    methods.reset();
  };

  const handleNext = async () => {
    const valid = await trigger(stepFields[activeStep]);
    if (valid) setActiveStep(prev => prev + 1);
  };

  const handleBack = () => setActiveStep(prev => prev - 1);

  const filtered = ITEMS_SAFE.filter(i =>
    i.label.toLowerCase().includes(search.toLowerCase())
  );

  const byCategory = filtered.reduce((acc, i) => {
    (acc[i.category] ||= []).push(i);
    return acc;
  }, {});

  const renderStep = () => {
    switch (activeStep) {
      case 0:
        return (
          <Paper elevation={3} sx={{ p: 3 }}>
            <Grid container spacing={3}>
              {["departureAddress", "arrivalAddress", "date"].map(name => (
                <Grid item xs={12} key={name}>
                  <Controller
                    name={name}
                    control={control}
                    render={({ field, fieldState }) => (
                      <TextField
                        {...field}
                        type={name === "date" ? "date" : "text"}
                        label={{
                          departureAddress: "Adresse de départ",
                          arrivalAddress: "Adresse d’arrivée",
                          date: "Date du déménagement"
                        }[name]}
                        fullWidth
                        InputLabelProps={name === "date" ? { shrink: true } : undefined}
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message}
                      />
                    )}
                  />
                </Grid>
              ))}
            </Grid>
          </Paper>
        );

      case 1:
        return (
          <Paper elevation={3} sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Controller
                  name="housingType"
                  control={control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      select
                      label="Type de logement"
                      fullWidth
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      sx={{
                        minWidth: 200, // largeur minimale visible même sans valeur
                        '& .MuiSelect-select': {
                          minHeight: 56, // garde le champ haut même vide
                          display: 'flex',
                          alignItems: 'center'
                        }
                      }}
                    >
                      {[
                        "Studio",
                        "chambre salon",
                        "chambre salon douche/toilette",
                        "chambre salon cuisine douche/toilette",
                        "2 chambres salon",
                        "2 chambres salon cuisine douche/toilette",
                        "2 chambres salon douche/toilette",
                        "3 chambres salon cuisine douche/toilette"
                      ].map(option => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="hasFloors"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Checkbox {...field} checked={field.value} />}
                      label="Le logement est-il à l'étage ?"
                    />
                  )}
                />
              </Grid>

              {hasFloors && (
                <>
                  <Grid item xs={6}>
                    <Controller
                      name="floor"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          type="number"
                          label="Numéro d’étage"
                          fullWidth
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Controller
                      name="hasElevator"
                      control={control}
                      render={({ field }) => (
                        <FormControlLabel
                          control={<Checkbox {...field} checked={field.value} />}
                          label="Ascenseur disponible"
                        />
                      )}
                    />
                  </Grid>
                </>
              )}

              <Grid item xs={12}>
                <Controller
                  name="volume"
                  control={control}
                  render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    select
                    label="Volume approximatif"
                    fullWidth
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    sx={{
                      minWidth: 200, // largeur minimale visible même sans valeur
                      '& .MuiSelect-select': {
                        minHeight: 56, // garde le champ haut même vide
                        display: 'flex',
                        alignItems: 'center'
                      }
                    }}
                  >
                    {["10-25", "25-35", "35-60", "60-75", "75-85", "85-100"].map(v => (
                      <MenuItem key={v} value={v}>
                        {v} m³
                      </MenuItem>
                    ))}
                  </TextField>

                  )}
                />
              </Grid>
            </Grid>
          </Paper>
        );

case 2:
  return (
    <Box>
      <Autocomplete
        freeSolo
        options={ITEMS_SAFE.map(i => i.label)}
        onInputChange={(_, v) => setSearch(v)}
        renderInput={params => (
          <TextField {...params} label="Rechercher un objet" fullWidth />
        )}
        sx={{ mb: 3 }}
      />

      {Object.entries(byCategory).map(([cat, items]) => (
        <Paper key={cat} elevation={2} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
            {cat}
          </Typography>
          <Grid container spacing={3}>
            {items.map(item => {
              const count = getValues(`items.${item.name}`);

              return (
                <Grid item xs={6} sm={4} md={3} key={item.name}>
                  <Paper
                    elevation={3}
                    sx={{
                      p: 2,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      textAlign: "center",
                      transition: "0.2s",
                      borderRadius: 2,
                      "&:hover": {
                        boxShadow: 6,
                        transform: "scale(1.02)",
                      }
                    }}
                  >
                    <Box color="primary.main" mb={1}>
                      {item.icon}
                    </Box>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      {item.label}
                    </Typography>

                    <Box display="flex" alignItems="center" justifyContent="center" mt={1}>
                      <IconButton
                        onClick={() =>
                          setValue(`items.${item.name}`, Math.max(0, count - 1))
                        }
                        disabled={count === 0}
                        size="small"
                      >
                        <Remove />
                      </IconButton>
                      <Typography variant="h6" mx={2}>
                        {count}
                      </Typography>
                      <IconButton
                        onClick={() =>
                          setValue(`items.${item.name}`, count + 1)
                        }
                        size="small"
                      >
                        <Add />
                      </IconButton>
                    </Box>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        </Paper>
      ))}
    </Box>
  );

      case 3:
        return (
          <Paper elevation={3} sx={{ p: 3 }}>
            <Grid container spacing={3}>
              {["fullName", "email", "phone", "additionalInfo"].map(name => (
                <Grid item xs={12} key={name}>
                  <Controller
                    name={name}
                    control={control}
                    render={({ field, fieldState }) => (
                      <TextField
                        {...field}
                        label={{
                          fullName: "Nom complet",
                          email: "Email",
                          phone: "Téléphone",
                          additionalInfo: "Informations complémentaires"
                        }[name]}
                        type={name === "email" ? "email" : "text"}
                        multiline={name === "additionalInfo"}
                        rows={name === "additionalInfo" ? 3 : 1}
                        fullWidth
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message}
                      />
                    )}
                  />
                </Grid>
              ))}
            </Grid>
          </Paper>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Déménagez maintenant
      </Typography>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
            {steps.map(label => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          {renderStep()}
          <Box display="flex" justifyContent="space-between" mt={4}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              variant="outlined"
            >
              Retour
            </Button>
            {activeStep === steps.length - 1 ? (
              <Button type="submit" variant="contained">
                Envoyer
              </Button>
            ) : (
              <Button onClick={handleNext} variant="contained">
                Suivant
              </Button>
            )}
          </Box>
        </form>
      </FormProvider>
    </Container>
  );
}
