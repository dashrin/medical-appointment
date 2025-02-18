import axios from "axios";
import { useEffect, useState } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import Table from 'react-bootstrap/Table';
import { Button, Pagination, Form, Row, Col } from 'react-bootstrap';
import './Appointment.css';

const CompletedAppointment = ({ allAppointments }) => {
  const location = useLocation();
  const { did } = location.state || {}; 

  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1); // Pagination state
  const [entriesPerPage, setEntriesPerPage] = useState(5); // Entries per page state
  const [searchTerm, setSearchTerm] = useState(""); // Search state

  // Effect to initialize appointments state with allAppointments
  useEffect(() => {
    setAppointments(allAppointments);
  }, [allAppointments]);

  // Filter appointments to get only completed appointments
  const completedAppointments = appointments.filter(appointment => 
    appointment.status === 'Completed'
  );

  // Filter based on search term
  const filteredAppointments = completedAppointments.filter(appointment =>
    `${appointment.patient.patient_firstName} ${appointment.patient.patient_middleInitial}. ${appointment.patient.patient_lastName}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const indexOfLastAppointment = currentPage * entriesPerPage;
  const indexOfFirstAppointment = indexOfLastAppointment - entriesPerPage;
  const currentAppointments = filteredAppointments.slice(indexOfFirstAppointment, indexOfLastAppointment);

  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(filteredAppointments.length / entriesPerPage); i++) {
    pageNumbers.push(i);
  }

  const convertTimeRangeTo12HourFormat = (timeRange) => {
    // Check if the timeRange is missing or empty
    if (!timeRange) return 'Not Assigned';
  
    const convertTo12Hour = (time) => {
      // Handle single time values like "10:00"
      if (!time) return '';
  
      let [hours, minutes] = time.split(':').map(Number);
      const period = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12; // Convert 0 or 12 to 12 in 12-hour format
  
      return `${hours}:${String(minutes).padStart(2, '0')} ${period}`;
    };
  
    // Handle both single times and ranges
    if (timeRange.includes(' - ')) {
      const [startTime, endTime] = timeRange.split(' - ');
      return `${convertTo12Hour(startTime)} - ${convertTo12Hour(endTime)}`;
    } else {
      return convertTo12Hour(timeRange); // Single time case
    }
  };

  return (
    <>
      <div style={{ padding: '30px', width: '100%' }}>
        <h4 className="mb-4">Completed Appointments</h4>

        {/* Entries per page and search functionality */}
        <Row className="d-flex align-items-center">
          <Col xs={12} md={3} className="mb-3 d-flex align-items-center">
            <div className="d-flex align-items-center w-100">
              <Form.Label className="me-2">Entries per page:</Form.Label>
              <Form.Control
                as="select"
                value={entriesPerPage}
                onChange={(e) => setEntriesPerPage(parseInt(e.target.value))}
                className="select-dropdown"
                style={{ width: 'auto' }}
              >
                <option value={5}>5</option>
                <option value={15}>15</option>
                <option value={30}>30</option>
                <option value={50}>50</option>
              </Form.Control>
            </div>
          </Col>

          <Col xs={12} md={9} className="mb-3 d-flex align-items-center">
            <div className="d-flex align-items-center w-100">
              <Form.Group controlId="formSearch" className="w-100 d-flex flex-wrap align-items-center">
                <Col xs={12} md={4}>
                  <Form.Label className="me-2">Search by Patient Name:</Form.Label>
                </Col>
                <Col xs={12} md={8} className="d-flex justify-content-end">
                  <Form.Control
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </Col>
              </Form.Group>
            </div>
          </Col>
        </Row>

        <Table responsive striped  variant="light" className="mt-3">
          <thead>
            <tr>
              <th>Patient Name</th>
              <th>Date</th>
              <th>Time</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentAppointments.length > 0 ? (
              currentAppointments.map((appointment, index) => {
                const patient = appointment.patient;
                const patientName = `${patient.patient_firstName} ${patient.patient_middleInitial}. ${patient.patient_lastName}`;
                return (
                  <tr key={appointment._id}>
                    <td>{patientName}</td>
                    <td>{new Date(appointment.date).toLocaleDateString()}</td>
                    <td>{convertTimeRangeTo12HourFormat(appointment.time)}</td>
                  
                    <td>
                      <div className="d-flex justify-content-center">
                      <div className="completed-appointment">
                        {appointment.status}
                      </div>
                    </div>
                    </td>
                    <td>
                      {/* If you want to add any actions, do so here */}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" className="text-center">No completed appointments found</td>
              </tr>
            )}
          </tbody>
        </Table>

        {error && <p>{error}</p>}

        {/* Pagination controls */}
        <Pagination>
          <Pagination.First onClick={() => setCurrentPage(1)} disabled={currentPage === 1} />
          <Pagination.Prev onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} />
          {pageNumbers.map(number => (
            <Pagination.Item key={number} active={number === currentPage} onClick={() => setCurrentPage(number)}>
              {number}
            </Pagination.Item>
          ))}
          <Pagination.Next onClick={() => setCurrentPage(prev => Math.min(prev + 1, pageNumbers.length))} disabled={currentPage === pageNumbers.length} />
          <Pagination.Last onClick={() => setCurrentPage(pageNumbers.length)} disabled={currentPage === pageNumbers.length} />
        </Pagination>
      </div>
    </>
  );
};

export default CompletedAppointment;
