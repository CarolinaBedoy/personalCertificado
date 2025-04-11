import { useEffect, useState } from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import Table from 'react-bootstrap/Table';
import { Container, Row, Col, Button } from 'react-bootstrap';
import Navbar from 'react-bootstrap/Navbar';

function Main() {
  const [lineas, setLineas] = useState([]);
  const [estaciones, setEstaciones] = useState([]);
  const [supervisores, setSupervisores] = useState([]);
  const [personal, setPersonal] = useState([]);
  const [certificaciones, setCertificaciones] = useState([]);
  const [lineaSeleccionada, setLineaSeleccionada] = useState(null);
  const [estacionSeleccionada, setEstacionSeleccionada] = useState(null);
  const [supervisorSeleccionado, setSupervisorSeleccionado] = useState(null);
  const [estatusSeleccionado, setEstatusSeleccionado] = useState(null);
  const [tablaDatos, setTablaDatos] = useState([]);
  const [modoFiltro, setModoFiltro] = useState('estacion');
  const [personalId, setPersonalId] = useState('');
  const [mostrarEstaciones, setMostrarEstaciones] = useState(false); // Estado para controlar la visibilidad de la columna de estaciones

  // Obtener líneas de producción
  useEffect(() => {
    fetch('http://localhost:5171/api/lineaproduccion')
      .then((res) => res.json())
      .then((data) => setLineas(data));
  }, []);

  // Obtener estaciones
  useEffect(() => {
    fetch('http://localhost:5171/api/estacion')
      .then((res) => res.json())
      .then((data) => setEstaciones(data));
  }, []);

  // Obtener supervisores
  useEffect(() => {
    fetch('http://localhost:5171/api/supervisor')
      .then((res) => res.json())
      .then((data) => setSupervisores(data));
  }, []);

  // Obtener personal
  useEffect(() => {
    fetch('http://localhost:5171/api/personal')
      .then((res) => res.json())
      .then((data) => setPersonal(data));
  }, []);

  // Obtener certificaciones
  useEffect(() => {
    fetch('http://localhost:5171/api/certificacion')
      .then((res) => res.json())
      .then((data) => setCertificaciones(data));
  }, []);

  // Filtrar estaciones por línea seleccionada
  const estacionesFiltradas = estaciones.filter(
    (e) => e.idLineaProduccion === lineaSeleccionada
  );

  // Función para filtrar y mostrar los datos en la tabla
  const mostrarDatos = () => {
    let datosFiltrados = [];

    if (personalId) {
      // Filtramos por el ID de personal
      datosFiltrados = personal.filter((p) => p.idPersonal === Number(personalId));
    } else if (modoFiltro === 'supervisor') {
      datosFiltrados = personal.filter((p) => {
        // Filtramos todas las certificaciones de la persona
        const certificacionesPersona = certificaciones.filter((c) => c.idPersonal === p.idPersonal);
        const validacionEstatus =
          estatusSeleccionado === 'Certificado'
            ? certificacionesPersona.every((c) => c.porcentajeEntrenamiento === 100) // Verificamos que todas las certificaciones estén completas
            : estatusSeleccionado === 'En entrenamiento'
            ? certificacionesPersona.some((c) => c.porcentajeEntrenamiento < 100) // Verificamos que al menos una esté en progreso
            : true;

        return (
          certificacionesPersona.length > 0 &&
          p.idSupervisor === supervisorSeleccionado &&
          validacionEstatus
        );
      });
    } else {
      datosFiltrados = personal.filter((p) => {
        // Filtramos todas las certificaciones de la persona
        const certificacionesPersona = certificaciones.filter((c) => c.idPersonal === p.idPersonal);
        const estacionValida = estacionSeleccionada
          ? certificacionesPersona.some((c) => c.idEstacion === estacionSeleccionada)
          : true;
        const validacionEstatus =
          estatusSeleccionado === 'Certificado'
            ? certificacionesPersona.every((c) => c.porcentajeEntrenamiento === 100) // Verificamos que todas las certificaciones estén completas
            : estatusSeleccionado === 'En entrenamiento'
            ? certificacionesPersona.some((c) => c.porcentajeEntrenamiento < 100) // Verificamos que al menos una esté en progreso
            : true;

        return (
          estacionValida &&
          validacionEstatus &&
          (lineaSeleccionada
            ? estaciones.find(
                (e) =>
                  e.idLineaProduccion === lineaSeleccionada &&
                  certificacionesPersona.some((c) => c.idEstacion === e.idEstacion) // Filtramos por la línea de producción
              )
            : true)
        );
      });
    }

    // Aquí agrupamos los resultados para evitar duplicados
    const resultadosAgrupados = datosFiltrados.map((persona) => {
      const certificacionesPersona = certificaciones.filter((c) => c.idPersonal === persona.idPersonal);
      return {
        ...persona,
        fechaCertificacion: certificacionesPersona.length > 0 ? certificacionesPersona[0].fechaCertificacion : 'No disponible', // Usamos la fecha de la primera certificación
        estacionesYEstatus: certificacionesPersona
          .map((cert) => {
            const estacion = estaciones.find((e) => e.idEstacion === cert.idEstacion);
            const estatus = cert.porcentajeEntrenamiento === 100 ? 'C' : 'E'; // C = Certificado, E = En entrenamiento
            return `${estacion ? estacion.nombre : 'Desconocida'} (${estatus})`;
          })
          .join(', '), // Unir todas las estaciones y estatus con coma
      };
    });

    setTablaDatos(resultadosAgrupados);
  };

  return (
    <>
      <Navbar className="bg-body-tertiary">
        <Container>
          <Navbar.Brand href="#home">Flex</Navbar.Brand>
          <Navbar.Toggle />
        </Container>
      </Navbar>

      <Container className="d-flex justify-content-center mt-4">
        {/* Radio buttons para el filtro */}
        <div className="form-check form-check-inline ms-3">
          <input
            className="form-check-input"
            type="radio"
            name="modoFiltro"
            id="filtroEstacion"
            value="estacion"
            checked={modoFiltro === 'estacion'}
            onChange={() => setModoFiltro('estacion')}
          />
          <label className="form-check-label" htmlFor="filtroEstacion">
            Filtrar por estación
          </label>
        </div>
        <div className="form-check form-check-inline ms-3">
          <input
            className="form-check-input"
            type="radio"
            name="modoFiltro"
            id="filtroSupervisor"
            value="supervisor"
            checked={modoFiltro === 'supervisor'}
            onChange={() => setModoFiltro('supervisor')}
          />
          <label className="form-check-label" htmlFor="filtroSupervisor">
            Filtrar por supervisor
          </label>
        </div>
      </Container>

      {/* Caja de texto para ingresar el ID del personal y el botón de búsqueda */}
      <Container className="d-flex justify-content-center mt-3">
        <Col md={3}>
          <input
            type="number"
            className="form-control"
            placeholder="ID Personal"
            min="1"
            value={personalId}
            onChange={(e) => setPersonalId(e.target.value)}
          />
        </Col>
        <Col md={2} className="ms-3">
          <Button variant="primary" onClick={() => { setMostrarEstaciones(true); mostrarDatos(); }}>Buscar personal</Button>
        </Col>
      </Container>

      <Container style={{ marginLeft: '120px', marginTop: '50px' }}>
        <Row className="d-flex">
          <Col md={3}>
            {/* Dropdown Línea de Producción */}
            <Dropdown
              onSelect={(e) => setLineaSeleccionada(Number(e))}
              data-bs-theme="dark"
            >
              <Dropdown.Toggle id="dropdown-linea" disabled={modoFiltro === 'supervisor'} variant="secondary">
                {lineaSeleccionada
                  ? lineas.find((l) => l.idLineaProduccion === lineaSeleccionada)?.nombre
                  : 'Línea de producción'}
              </Dropdown.Toggle>

              <Dropdown.Menu>
                {lineas.map((linea) => (
                  <Dropdown.Item
                    key={linea.idLineaProduccion}
                    eventKey={linea.idLineaProduccion}
                  >
                    {linea.nombre}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>

            <br />

            {/* Dropdown Estación */}
            <Dropdown
              onSelect={(e) => setEstacionSeleccionada(Number(e))}
              data-bs-theme="dark"
            >
              <Dropdown.Toggle id="dropdown-estacion" disabled={modoFiltro === 'supervisor'} variant="secondary">
                {estacionSeleccionada
                  ? estaciones.find((l) => l.idEstacion === estacionSeleccionada)?.nombre
                  : 'Estación'}
              </Dropdown.Toggle>

              <Dropdown.Menu>
                {estacionesFiltradas.length > 0 ? (
                  estacionesFiltradas.map((estacion) => (
                    <Dropdown.Item
                      key={estacion.idEstacion}
                      eventKey={estacion.idEstacion}
                    >
                      {estacion.nombre}
                    </Dropdown.Item>
                  ))
                ) : (
                  <Dropdown.Item disabled>No hay estaciones disponibles</Dropdown.Item>
                )}
              </Dropdown.Menu>
            </Dropdown>

            <br />
           
            {/* Dropdown Supervisor */}
            <Dropdown
              onSelect={(e) => setSupervisorSeleccionado(Number(e))}
              data-bs-theme="dark"
            >
              <Dropdown.Toggle id="dropdown-supervisor" disabled={modoFiltro === 'estacion'} variant="secondary">
                {supervisorSeleccionado
                  ? supervisores.find((l) => l.idSupervisor === supervisorSeleccionado)?.nombre
                  : 'Supervisores'}
              </Dropdown.Toggle>

              <Dropdown.Menu>
                {supervisores.length > 0 ? (
                  supervisores.map((supervisor) => (
                    <Dropdown.Item
                      key={supervisor.idSupervisor}
                      eventKey={supervisor.idSupervisor}
                    >
                      {supervisor.nombre}
                    </Dropdown.Item>
                  ))
                ) : (
                  <Dropdown.Item disabled>No hay supervisores disponibles</Dropdown.Item>
                )}
              </Dropdown.Menu>
            </Dropdown>

            <br />

            {/* Dropdown Estatus */}
            <Dropdown
              onSelect={(e) => setEstatusSeleccionado(e)}
              data-bs-theme="dark"
            >
              <Dropdown.Toggle id="dropdown-estatus" variant="secondary">
                {estatusSeleccionado || 'Estatus'}
              </Dropdown.Toggle>

              <Dropdown.Menu>
                <Dropdown.Item eventKey="Certificado">Certificado</Dropdown.Item>
                <Dropdown.Item eventKey="En entrenamiento">En entrenamiento</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>

            <br />
            <Button variant="primary" onClick={mostrarDatos}>Mostrar Datos</Button>
          </Col>

          {/* TABLE */}
          <Col md={6}>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Nómina</th>
                  <th>Nombre</th>
                  <th>Supervisor</th>
                  <th>Fecha de certificación</th>
                  <th>Turno</th>
                  {mostrarEstaciones && <th>Estaciones y Estatus</th>} {/* Condicional para mostrar la columna */}
                </tr>
              </thead>
              <tbody>
                {tablaDatos.length > 0 ? (
                  tablaDatos.map((persona) => {
                    const certificacion = certificaciones.find((c) => c.idPersonal === persona.idPersonal);
                    return (
                      <tr key={persona.idPersonal}>
                        <td>{persona.idPersonal}</td>
                        <td>{persona.nombre}</td>
                        <td>{supervisores.find((s) => s.idSupervisor === persona.idSupervisor)?.nombre}</td>
                        <td>{certificacion ? certificacion.fechaCertificacion : 'No disponible'}</td>
                        <td>{persona.turno}</td>
                        {mostrarEstaciones && <td>{persona.estacionesYEstatus || 'No disponible'}</td>} {/* Columna condicional */}
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={mostrarEstaciones ? 6 : 5}>No se encontraron datos.</td> {/* Ajuste en el colspan */}
                  </tr>
                )}
              </tbody>
            </Table>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default Main;
