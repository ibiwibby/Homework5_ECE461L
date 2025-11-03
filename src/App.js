import React, { useMemo, useState } from "react";
import "./App.css";
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Button,
  IconButton,
  Stack,
  Divider,
  LinearProgress,
  Tooltip,
  Box,
  Avatar,
  CssBaseline,
  ThemeProvider,
  createTheme,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import LogoutIcon from "@mui/icons-material/Logout";
import LoginIcon from "@mui/icons-material/Login";
import GroupsIcon from "@mui/icons-material/Groups";
import MemoryIcon from "@mui/icons-material/Memory";

/* ---------- THEME: dark with color accents ---------- */
const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#7aa2ff" },   // ink blue
    secondary: { main: "#bf5700" }, // UT burnt orange
    background: { default: "#0b1020", paper: "#0f1529" },
    text: { primary: "#e6e6f0", secondary: "#9aa0ad" },
  },
  shape: { borderRadius: 16 },
});

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <AppBar position="sticky" color="transparent" elevation={0}>
        <Toolbar>
          <MemoryIcon sx={{ mr: 1, color: "secondary.main" }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Hardware Manager — Projects
          </Typography>
          <Chip color="secondary" label="Frontend Only (Mocked)" />
        </Toolbar>
      </AppBar>

      {/* Gradient hero band to avoid black & white feel */}
      <Box
        sx={{
          background:
            "linear-gradient(90deg, rgba(122,162,255,.15), rgba(191,87,0,.18))",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <Container maxWidth="lg" sx={{ py: 3 }}>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Projects
          </Typography>
          <Typography color="text.secondary">
            Join teams and manage shared hardware sets.
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Projects />
      </Container>
    </ThemeProvider>
  );
}

/* ---------- MOCK DATA ---------- */
const INITIAL_HARDWARE_SETS = [
  { id: "hs1", name: "HW Set A", capacity: 20 },
  { id: "hs2", name: "HW Set B", capacity: 12 },
  { id: "hs3", name: "Sensors Kit", capacity: 8 },
];

const INITIAL_PROJECTS = [
  {
    id: "p1",
    name: "Autonomous Cart",
    description:
      "Self-driving cart using stereo vision. Tracks, avoids obstacles, and delivers snacks.",
    tags: ["Robotics", "Vision"],
    members: 4,
    isMember: true,
    hardware: [
      { setId: "hs1", qty: 6 },
      { setId: "hs2", qty: 2 },
    ],
  },
  {
    id: "p2",
    name: "Smart Greenhouse",
    description:
      "IoT greenhouse with environmental control and data logging (ESP32 + Cloud).",
    tags: ["IoT", "Cloud"],
    members: 3,
    isMember: false,
    hardware: [
      { setId: "hs2", qty: 3 },
      { setId: "hs3", qty: 2 },
    ],
  },
  {
    id: "p3",
    name: "AR Campus Tour",
    description:
      "Mobile AR app overlaying campus history and POIs; markerless tracking.",
    tags: ["AR", "Mobile"],
    members: 5,
    isMember: false,
    hardware: [{ setId: "hs1", qty: 2 }],
  },
];

/* ---------- HELPERS ---------- */
function sumCheckedOutAcrossProjects(projects, setId) {
  return projects.reduce((acc, p) => {
    const entry = p.hardware.find((h) => h.setId === setId);
    return acc + (entry ? entry.qty : 0);
  }, 0);
}

/* ---------- ROOT PROJECTS COMPONENT ---------- */
function Projects() {
  const [projects, setProjects] = useState(INITIAL_PROJECTS);
  const [hardwareSets] = useState(INITIAL_HARDWARE_SETS);

  const availability = useMemo(() => {
    const map = {};
    hardwareSets.forEach((set) => {
      const totalOut = sumCheckedOutAcrossProjects(projects, set.id);
      map[set.id] = {
        capacity: set.capacity,
        available: Math.max(0, set.capacity - totalOut),
      };
    });
    return map;
  }, [projects, hardwareSets]);

  const handleToggleMembership = (projectId) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, isMember: !p.isMember } : p))
    );
  };

  const handleAdjustCheckout = (projectId, setId, delta) => {
    setProjects((prev) => {
      const currentlyAvailable = availability[setId]?.available ?? 0;
      return prev.map((p) => {
        if (p.id !== projectId) return p;
        const hardware = [...p.hardware];
        const idx = hardware.findIndex((h) => h.setId === setId);
        const currentQty = idx >= 0 ? hardware[idx].qty : 0;

        let nextQty = currentQty + delta;
        if (nextQty < 0) nextQty = 0; // no negatives
        if (delta > 0 && delta > currentlyAvailable) {
          nextQty = currentQty + Math.max(0, currentlyAvailable); // clamp
        }

        if (idx >= 0) hardware[idx] = { setId, qty: nextQty };
        else hardware.push({ setId, qty: nextQty });

        return { ...p, hardware };
      });
    });
  };

  return (
    <Stack spacing={3}>
      <HeaderSummary
        hardwareSets={hardwareSets}
        availability={availability}
        projects={projects}
      />
      <Stack spacing={2}>
        {projects.map((p) => (
          <ProjectCard
            key={p.id}
            project={p}
            hardwareSets={hardwareSets}
            availability={availability}
            onToggleMembership={() => handleToggleMembership(p.id)}
            onAdjustCheckout={(setId, delta) =>
              handleAdjustCheckout(p.id, setId, delta)
            }
          />
        ))}
      </Stack>
    </Stack>
  );
}

/* ---------- HEADER SUMMARY (reused) ---------- */
function HeaderSummary({ hardwareSets, availability, projects }) {
  const totalProjects = projects.length;
  const joined = projects.filter((p) => p.isMember).length;

  return (
    <Card
      sx={{
        backgroundImage: "none",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <CardContent>
        <Stack
          direction={{ xs: "column", md: "row" }}
          alignItems={{ md: "center" }}
          spacing={2}
          justifyContent="space-between"
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <GroupsIcon />
            <Typography variant="h6">Projects you can join</Typography>
            <Chip label={`${joined}/${totalProjects} joined`} />
          </Stack>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {hardwareSets.map((hs) => (
              <Chip
                key={hs.id}
                icon={<MemoryIcon />}
                label={`${hs.name}: ${availability[hs.id]?.available ?? 0}/${hs.capacity} available`}
                variant="outlined"
              />
            ))}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

/* ---------- PROJECT CARD (reused) ---------- */
function ProjectCard({
  project,
  hardwareSets,
  availability,
  onToggleMembership,
  onAdjustCheckout,
}) {
  return (
    <Card
      variant="outlined"
      sx={{ backgroundImage: "none", borderColor: "rgba(255,255,255,0.12)" }}
    >
      <CardHeader
        avatar={<Avatar>{project.name[0]}</Avatar>}
        title={
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            <Typography variant="h6">{project.name}</Typography>
            <Chip size="small" label={`${project.members} members`} />
            {project.isMember ? (
              <Chip size="small" color="success" label="Joined" />
            ) : (
              <Chip size="small" color="warning" label="Not a member" />
            )}
          </Stack>
        }
        subheader={project.tags.map((t) => (
          <Chip key={t} size="small" sx={{ mr: 0.5 }} label={t} />
        ))}
        action={
          <Button
            variant={project.isMember ? "outlined" : "contained"}
            color={project.isMember ? "warning" : "primary"}
            startIcon={project.isMember ? <LogoutIcon /> : <LoginIcon />}
            onClick={onToggleMembership}
          >
            {project.isMember ? "Leave" : "Join"}
          </Button>
        }
      />
      <Divider />
      <CardContent>
        <Typography sx={{ mb: 2 }}>{project.description}</Typography>
        <Stack spacing={1}>
          {hardwareSets.map((set) => {
            const entry = project.hardware.find((h) => h.setId === set.id);
            const qty = entry ? entry.qty : 0;
            const avail = availability[set.id]?.available ?? 0;
            return (
              <HardwareSetRow
                key={set.id}
                setName={set.name}
                qty={qty}
                capacity={set.capacity}
                available={avail}
                onAdd={() => onAdjustCheckout(set.id, 1)}
                onRemove={() => onAdjustCheckout(set.id, -1)}
                disabled={!project.isMember}
              />
            );
          })}
        </Stack>
      </CardContent>
    </Card>
  );
}

/* ---------- REUSABLE ROW ---------- */
function HardwareSetRow({
  setName,
  qty,
  capacity,
  available,
  onAdd,
  onRemove,
  disabled,
}) {
  const percent = Math.min(
    100,
    Math.round(((capacity - available) / capacity) * 100)
  );
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={1}
      alignItems={{ sm: "center" }}
    >
      <Box sx={{ minWidth: 160 }}>
        <Typography variant="subtitle2">{setName}</Typography>
        <Typography variant="caption" color="text.secondary">
          In use: {capacity - available}/{capacity}
        </Typography>
        <LinearProgress
          variant="determinate"
          value={percent}
          sx={{ mt: 0.5 }}
          color={percent > 80 ? "warning" : "primary"}
        />
      </Box>

      <Stack direction="row" spacing={1} alignItems="center" sx={{ ml: { sm: "auto" } }}>
        <Tooltip title="Decrease checked out">
          <span>
            <IconButton onClick={onRemove} disabled={disabled || qty === 0}>
              <RemoveIcon />
            </IconButton>
          </span>
        </Tooltip>
        <Chip color="primary" label={`Checked out: ${qty}`} />
        <Tooltip title="Increase checked out">
          <span>
            <IconButton onClick={onAdd} disabled={disabled || available === 0}>
              <AddIcon />
            </IconButton>
          </span>
        </Tooltip>
        <Chip variant="outlined" color="secondary" label={`${available} available`} />
      </Stack>
    </Stack>
  );
}
