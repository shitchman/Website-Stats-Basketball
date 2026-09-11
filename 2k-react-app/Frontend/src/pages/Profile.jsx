import { useEffect, useState } from "react";
import { Container, Row, Col, Card, Table, Button, Modal } from "react-bootstrap";
import { BsPencilFill, BsPlusCircleFill, BsPersonPlusFill } from "react-icons/bs";

import { apiFetch } from "../../api.js";

import AddBuild from "../Modals/AddBuild";
import EditBuild from "../Modals/EditBuild";
import AddFriend from "../Modals/AddFriend";
import EditProfile from "../Modals/EditProfile";
import EditFriend from "../Modals/EditFriend";
import AccessAuthorisation from "../Modals/AccessAuthorisation.jsx";
import DeleteAccount from "../Modals/DeleteAccount.jsx";

function Profile({ user, setUser, endSession }) {

   const [activeModal, setActiveModal] = useState(null);
   const [friends, setFriendsList] = useState([]);
   const [builds, setBuildsList] = useState([]);

   // Sets the document title
   useEffect(() => {
      document.title = "Hoop Stats - Profile";
   }, []);

   // Loads the users friends/teammates
   useEffect(() => {
      const loadFriends = async () => {
         const response = await apiFetch('/friends/myFriends');
         if (response.ok) {
            setFriendsList(await response.json());
         }
      };

      loadFriends();
   }, []);

   //Loads the users builds
   useEffect(() => {
      const loadBuilds = async () => {
         const response = await apiFetch('/builds/myBuilds');
         if (response.ok) {
            setBuildsList(await response.json());
         }
      };

      loadBuilds();
   }, [])

   return (
      <Container fluid className="mt-3">
         {/* Profile heading */}
         <Row className="d-flex justify-content-center">
            <Col sm={12} md={11}>
               <Card className="hero-card mb-4">
                  <div className="hero-glow hero-glow-top-right"></div>
                  <div className="hero-glow hero-glow-top-left"></div>

                  <Card.Body className="hero-content text-white">
                     <Row>
                        <Col xs={10} className="large-profile-header-custom-col">
                           <h1 style={{ color: "rgba(255, 102, 0, 0.95)" }}>{user?.username ?? "Loading..."}</h1>

                           <p className="fw-light" style={{ color: "rgba(145, 148, 148, 1.0)" }}>Joined: 01 - 02 - 26</p>
                        </Col>

                        <Col xs={2} className="large-profile-header-custom-col">
                           <Row className="justify-content-end align-items-start g-0">
                              <Button variant="link" className="text-decoration-none p-0 w-auto" onClick={() => setActiveModal("accessAuthorisationEditProfile")}>
                                 <span className="fw-light" style={{ color: "rgba(145, 148, 148, 1.0)" }}>Edit Profile</span>
                              </Button>
                           </Row>
                        </Col>
                     </Row>
                  </Card.Body>
               </Card>
            </Col>
         </Row>

         <Row className="d-flex align-items-stretch justify-content-center">
            {/* List of users 'builds' */}
            <Col sm={12} md={6} xxl={5} className="d-flex flex-column">
               <Card className="hero-card mb-4 flex-grow-1">
                  <div className="hero-glow hero-glow-top-right"></div>
                  <div className="hero-glow hero-glow-bottom-left"></div>

                  <Card.Body className="hero-content text-white flex-grow-1">
                     <Row>
                        <Col xs={6} className="large-profile-custom-col">
                           <h1 style={{ color: "rgba(255, 102, 0, 0.95)" }}>Builds</h1>
                        </Col>

                        <Col xs={3} className="d-flex small-profile-custom-col">
                           <Button variant="link" className="text-decoration-none d-flex align-items-center gap-2">
                              <span className="fw-semibold" style={{ color: "rgba(145, 148, 148, 1.0)" }} onClick={() => setActiveModal("accessAuthorisationEditBuild")}>Edit </span>
                              <BsPencilFill size={20} style={{ color: "rgba(255, 102, 0, 0.95)" }} />
                           </Button>
                        </Col>

                        <Col xs={3} className="d-flex small-profile-custom-col">
                           <Button variant="link" className="text-decoration-none d-flex align-items-center gap-2" onClick={() => setActiveModal("addBuild")}>
                              <span className="fw-semibold" style={{ color: "rgba(145, 148, 148, 1.0)" }}>Add </span>
                              <BsPlusCircleFill size={20} style={{ color: "rgba(255, 102, 0, 0.95)" }} />
                           </Button>
                        </Col>
                     </Row>

                     <Table className="recent-games-table dashboard-tables" responsive >
                        <thead>
                           <tr>
                              <th>Name</th>
                              <th>Position</th>
                           </tr>
                        </thead>

                        <tbody>
                           {builds.map((build, index) => (
                              <tr key={build.id || index}>
                                 <td className="w-75">{build.build_name}</td>
                                 <td className="w-25">{build.preferred_position}</td>
                              </tr>
                           ))}
                        </tbody>
                     </Table>
                  </Card.Body>
               </Card>
            </Col>
            {/* List of users friends/teammates */}
            <Col sm={12} md={6} xxl={5} className="d-flex flex-column">
               <Card className="hero-card mb-4 flex-grow-1">
                  <div className="hero-glow hero-glow-top-right"></div>
                  <div className="hero-glow hero-glow-bottom-left"></div>

                  <Card.Body className="hero-content text-white flex-grow-1">
                     <Row>
                        <Col xs={6} className="large-profile-custom-col">
                           <h1 style={{ color: "rgba(255, 102, 0, 0.95)" }}>Friends</h1>
                        </Col>

                        <Col xs={3} className="d-flex small-profile-custom-col">
                           <Button variant="link" className="text-decoration-none d-flex align-items-center gap-2">
                              <span className="fw-semibold" style={{ color: "rgba(145, 148, 148, 1.0)" }} onClick={() => setActiveModal("accessAuthorisationEditFriend")}>Edit </span>
                              <BsPencilFill size={20} style={{ color: "rgba(255, 102, 0, 0.95)" }} />
                           </Button>
                        </Col>

                        <Col xs={3} className="d-flex small-profile-custom-col">
                           <Button variant="link" className="text-decoration-none d-flex align-items-center gap-2" onClick={() => setActiveModal("addFriend")}>
                              <span className="fw-semibold" style={{ color: "rgba(145, 148, 148, 1.0)" }}>Add </span>
                              <BsPersonPlusFill size={24} style={{ color: "rgba(255, 102, 0, 0.95)" }} />
                           </Button>
                        </Col>
                     </Row>

                     <Table className="recent-games-table dashboard-tables" responsive >
                        <colgroup>
                           <col style={{ width: "40%" }} />
                           <col style={{ width: "40%" }} />
                           <col style={{ width: "20%" }} />
                        </colgroup>

                        <thead>
                           <tr>
                              <th>Name</th>
                              <th>OnlineID</th>
                              <th>Builds</th>
                           </tr>
                        </thead>

                        <tbody>
                           {friends.map((friend, index) => (
                              <tr key={friend.id || index}>
                                 <td>{friend.name}</td>
                                 <td>{friend.online_ID}</td>
                                 <td>{friend.friendBuildCount}</td>
                              </tr>
                           ))}
                        </tbody>
                     </Table>
                  </Card.Body>
               </Card>
            </Col>
         </Row>
         {/* 'Popouts' from the proflile page*/}
         <Modal show={activeModal !== null} onHide={() => setActiveModal(null)} centered size="lg" >
            <Modal.Body className="boomers-hero-overlay d-flex">

               {activeModal === "addFriend" && <AddFriend setFriends={setFriendsList} onClose={() => setActiveModal(null)} />}
               {activeModal === "accessAuthorisationEditFriend" && <AccessAuthorisation user={user} onVerified={() => setActiveModal("editFriend")} />}
               {activeModal === "editFriend" && <EditFriend setFriends={setFriendsList} onClose={() => setActiveModal(null)} />}

               {activeModal === "addBuild" && <AddBuild setBuilds={setBuildsList} onClose={() => setActiveModal(null)} />}
               {activeModal === "accessAuthorisationEditBuild" && <AccessAuthorisation user={user} onVerified={() => setActiveModal("editBuild")} />}
               {activeModal === "editBuild" && <EditBuild setBuilds={setBuildsList} onClose={() => setActiveModal(null)} />}

               {activeModal === "accessAuthorisationEditProfile" && <AccessAuthorisation user={user} onVerified={() => setActiveModal("editProfile")} />}
               {activeModal === "editProfile" && <EditProfile user={user} setUser={setUser} onClose={() => setActiveModal(null)} onDeleteAccount={() => setActiveModal("deleteAccount")} />}
               {activeModal === "deleteAccount" && <DeleteAccount onClose={() => setActiveModal(null)} onDeleted={() => { setActiveModal(null); endSession(); }} />}


            </Modal.Body>
         </Modal>
      </Container>
   );
}

export default Profile;