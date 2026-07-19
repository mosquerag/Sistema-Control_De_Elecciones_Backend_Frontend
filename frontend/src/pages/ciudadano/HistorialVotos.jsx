/**
 * ARCHIVO: HistorialVotos.jsx
 * UBICACIÓN: /frontend/src/pages/ciudadano/HistorialVotos.jsx
 */

import { useState, useEffect } from "react";
import { getMisVotos } from "@/api/votos";
import { manejarErrorApi } from "@/utils/alertas";
import Loader from "@/components/common/Loader";
import PageHeader from "@/components/common/PageHeader";
import BackButton from "@/components/common/BackButton";
import MisVotos from "./MisVotos";

const HistorialVotos = () => {
  const [votos, setVotos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadVotos = async () => {
      try {
        const res = await getMisVotos();
        setVotos(res.data?.data || res.data || []);
      } catch (error) {
        manejarErrorApi(error, "Error al cargar historial de votos");
      } finally {
        setLoading(false);
      }
    };
    loadVotos();
  }, []);

  if (loading) return <Loader fullScreen />;

  return (
    <>
      <PageHeader
        title="Mi Historial de Votaciones"
        action={<BackButton to="/ciudadano/dashboard" />}
      />
      <MisVotos votos={votos} />
    </>
  );
};

export default HistorialVotos;
