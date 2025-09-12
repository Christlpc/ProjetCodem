// src/components/DevisStepper.jsx
import React, { useState } from "react";
import {
  Stepper, Step, StepLabel, Button, Typography, Box, TextField,
  FormControlLabel, Checkbox, Container, IconButton, Autocomplete,
  MenuItem, Paper, Grid, Alert
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
  const [activeStep, setActiveStep] = useState(0);
  const [search, setSearch] = useState("");
  const [serverMsg, setServerMsg] = useState({ type: "", text: "" });

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      departureAddress: "",
      arrivalAddress: "",
      date: "",
      housingType: "",
      hasFloors: false,
      floor:"",
      hasElevator: false,
      volume: "",
      items: ITEMS_SAFE.reduce((acc, i) => ({ ...acc, [i.name]: 0 }), {}),
      fullName: "",
      email: "",
      phone: "",
      additionalInfo: ""
    }
  });

  const { control, handleSubmit, setValue, getValues, trigger, watch, reset, getValues: gv } = methods;
  const hasFloors = watch("hasFloors");

  // --- Helpers ---
  // Normalise les nombres saisis: "80 000", "80.000", "80,000" -> "80000"
  const normalizeNumber = (val) => {
    if (val == null) return "";
    return String(val).replace(/[ .,\u00A0]/g, "");
  };

  const toIntOrUndefined = (val) => {
    const s = normalizeNumber(val);
    if (!s) return undefined;
    const n = parseInt(s, 10);
    return Number.isFinite(n) ? n : undefined;
  };

  const buildItemsArray = (itemsObj) => {
    const arr = [];
    for (const it of ITEMS_SAFE) {
      const qty = Number(itemsObj[it.name] ?? 0);
      if (qty > 0) {
        arr.push({ name: it.name, label: it.label, quantity: qty });
      }
    }
    return arr;
  };

  const onSubmit = async (data) => {
    setServerMsg({ type: "", text: "" });

    // ---- Mapping vers CI4 ----
    const payload = {
      nom: data.fullName.trim(),
      email: data.email.trim(),
      telephone: data.phone ? String(data.phone).trim() : undefined,
      typeLogement: data.housingType,                           // string
      volume: normalizeNumber(data.volume),                     // string OK pour le back
      adresseDepart: data.departureAddress.trim(),
      adresseArrivee: data.arrivalAddress.trim(),
      dateSouhaitee: data.date,                                 // YYYY-MM-DD
      etages: data.hasFloors ? toIntOrUndefined(data.floor) : undefined,
      ascenseur: data.hasElevator ? 1 : 0,                      // 1/0
      message: data.additionalInfo?.trim() || undefined,
      items: buildItemsArray(data.items),                       // [{name,label,quantity}]
    };

    try {
      const { data: res } = await axios.post(
        "http://localhost:8080/api/demandes",
        payload,
        { headers: { "Content-Type": "application/json" } }
      );

      setServerMsg({
        type: "success",
        text: `✅ ${res?.message || "Demande enregistrée"} (réf: ${res?.reference || "—"})`
      });

      setActiveStep(0);
      reset();
    } catch (err) {
      const apiErrs = err?.response?.data?.errors;
      const text =
        err?.response?.data?.message ||
        (apiErrs ? Object.values(apiErrs).join(" | ") : "Une erreur est survenue.");
      setServerMsg({ type: "error", text });
    }
  };

  const handleNext = async () => {
    const valid = await trigger(stepFields[activeStep]);
    if (valid) setActiveStep(prev => prev + 1);
  };

  const handleBack = () => setActiveStep(prev => prev - 1);

  const allItemsArray = ITEMS_SAFE;
  const filtered = allItemsArray.filter(i =>
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
                        minWidth: 200,
                        "& .MuiSelect-select": { minHeight: 56, display: "flex", alignItems: "center" }
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
                        <TextField {...field} type="number" label="Numéro d’étage" fullWidth />
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
                      helperText={fieldState.error?.message || "Ex: 10-25 m³"}
                      sx={{
                        minWidth: 200,
                        "& .MuiSelect-select": { minHeight: 56, display: "flex", alignItems: "center" }
                      }}
                    >
                      {["10-25", "25-35", "35-60", "60-75", "75-85", "85-100"].map(v => (
                        <MenuItem key={v} value={v}>{v} m³</MenuItem>
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
                <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
                  {cat}
                </Typography>
                <Grid container spacing={3}>
                {items.map(item => {
                  const count = watch(`items.${item.name}`);
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
                          "&:hover": { boxShadow: 6, transform: "scale(1.02)" }
                        }}
                      >
                        <Box color="primary.main" mb={1}>{item.icon}</Box>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                          {item.label}
                        </Typography>
                        <Box display="flex" alignItems="center" justifyContent="center" mt={1}>
                          <IconButton
                            onClick={() => setValue(`items.${item.name}`, Math.max(0, (count || 0) - 1))}
                            disabled={count === 0}
                            size="small"
                          >
                            <Remove />
                          </IconButton>
                          <Typography variant="h6" mx={2}>{count || 0}</Typography>
                          <IconButton
                            onClick={() => setValue(`items.${item.name}`, (count || 0) + 1)}
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

      {serverMsg.text && (
        <Alert severity={serverMsg.type === "success" ? "success" : "error"} sx={{ mb: 2 }}>
          {serverMsg.text}
        </Alert>
      )}

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
            <Button disabled={activeStep === 0} onClick={handleBack} variant="outlined">
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
