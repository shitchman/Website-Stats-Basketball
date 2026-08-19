import { Container, Row, Card, Form, Button } from "react-bootstrap";
import { useState, useEffect } from "react";
import { apiFetch } from "../../api.js";

function EditFriend({ setFriends, setBuilds, onClose }) {
   const [friends, setFriendsList] = useState([]);
   const [selectedFriendId, setSelectedFriendId] = useState("");

   const [friendsBuilds, setFriendsBuildslist] = useState([]);
   const [selectedFriendBuildId, setSelectedFriendBuildId] = useState("");

   const [updateOption, setUpdateOption] = useState("");

   const [friendName, setFriendName] = useState("");
   const [friendOnlineID, setFriendOnlineID] = useState("");

   const [buildName, setBuildName] = useState("");
   const [preferredPosition, setPreferredPosition] = useState("");

   const [showAlert, setShowAlert] = useState(false);
   const [alertMessage, setAlertMessage] = useState("");

   const [isSubmitting, setIsSubmitting] = useState(false);

   useEffect(() => {
      const loadFriends = async () => {
         const response = await apiFetch('/friends/myFriends');
         if (response.ok) {
            setFriendsList(await response.json());
         }
      };
      loadFriends();
   }, []);

   useEffect(() => {
      const loadFriendsBuilds = async () => {
         const response = await apiFetch(`/builds/friendsBuilds`);
         if (response.ok) {
            setFriendsBuildslist(await response.json());
         }
      };

      loadFriendsBuilds();
   }, []);

   const handleFriendSelection = (event) => {
      const friendId = Number(event.target.value);
      const selected = friends.find((friend) => friend.id === friendId);

      setSelectedFriendId(friendId || "");

      if (!selected) {
         setFriendName("");
         setFriendOnlineID("");
         return;
      }

      setFriendName(selected.name ?? "");
      setFriendOnlineID(selected.online_ID ?? "");
   };

   const handleUpdateOption = (event) => {
      const selectedOption = event.target.value;
      setUpdateOption(selectedOption);
   };

   const handleFriendEditSubmit = async (e) => {
      e.preventDefault();

      if (!selectedFriendId) {
         setAlertMessage("Please select a friend to edit.");
         setShowAlert(true);
         return;
      }

      if (!friendName.trim() || !friendOnlineID.trim()) {
         setAlertMessage("Please complete the friend's name and online ID.");
         setShowAlert(true);
         return;
      }

      setShowAlert(false);
      setAlertMessage("");
      setIsSubmitting(true);

      try {
         const response = await apiFetch(`/friends/updateFriend?friend_id=${selectedFriendId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
               name: friendName.trim(),
               online_ID: friendOnlineID.trim(),
            }),
         });

         const responseText = await response.text();
         let data = null;

         if (responseText) {
            try {
               data = JSON.parse(responseText);
            } catch {
               data = null;
            }
         }

         if (!response.ok) {
            setAlertMessage(data?.detail || `Update failed (${response.status}).`);
            setShowAlert(true);
            return;
         }

         const friendsListResponse = await apiFetch('/friends/myFriends');
         
         if (!friendsListResponse.ok) {
            setAlertMessage(`Friend updated successfully, but the friends list could not be reloaded (${friendsListResponse.status}).`);
            setShowAlert(true);
            return;
         }
         setFriends(await friendsListResponse.json());
         onClose();

      } catch (error) {
         console.error('Error updating friend:', error);
         setAlertMessage("An error occurred while updating the friend.");
         setShowAlert(true);
      } finally {
         setIsSubmitting(false);
      }
   };

   const handleBuildAddSubmit = async (e) => {
      e.preventDefault();

      if (!selectedFriendId) {
         setAlertMessage("Please select a friend to add a build for.");
         setShowAlert(true);
         return;
      }

      if (!buildName.trim() || !preferredPosition.trim()) {
         setAlertMessage("Please complete the build name and preferred position.");
         setShowAlert(true);
         return;
      }

      setShowAlert(false);
      setAlertMessage("");
      setIsSubmitting(true);

      try {
         const response = await apiFetch('/builds/addFriendBuild', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
               friend_id: selectedFriendId,
               build_name: buildName.trim(),
               preferred_position: preferredPosition.trim(),
            }),
         });

         const responseText = await response.text();
         let data = null;

         if (responseText) {
            try {
               data = JSON.parse(responseText);
            } catch {
               data = null;
            }
         }

         if (!response.ok) {
            setAlertMessage(data?.detail || `Add build failed (${response.status}).`);
            setShowAlert(true);
            return;
         }

         const buildListResponse = await apiFetch('/builds/friendsBuilds');

         if (!buildListResponse.ok) {
            setAlertMessage("Build added successfully, but the builds list could not be reloaded.");
            setShowAlert(true);
            return;
         }

         const updatedBuilds = await buildListResponse.json();
         if (setBuilds) {
            setBuilds(updatedBuilds);
         }

         const friendsListResponse = await apiFetch('/friends/myFriends');
         if (!friendsListResponse.ok) {
            setAlertMessage("Build added successfully, but the friends list could not be reloaded.");
            setShowAlert(true);
            return;
         }

         const updatedFriends = await friendsListResponse.json();
         setFriends(updatedFriends);
         onClose();

      } catch (error) {
         console.error('Error adding build:', error);
         setAlertMessage("An error occurred while adding the build.");
         setShowAlert(true);
      } finally {
         setIsSubmitting(false);
      }
   };

   const handleBuildEditSelection = (event) => {
      const buildId = Number(event.target.value);
      const selected = friendsBuilds.find((build) => build.id === buildId);
      
      setSelectedFriendBuildId(buildId || "");

      if (!selected) {
         setBuildName("");
         setPreferredPosition("");
         return;
      }

      setBuildName(selected.build_name ?? "");
      setPreferredPosition(selected.preferred_position ?? "");
   };

   const handleBuildEditSubmit = async (e) => {
      e.preventDefault();

      if (!selectedFriendBuildId) {
         setAlertMessage("Please select a build to edit.");
         setShowAlert(true);
         return;
      }

      if (!buildName.trim() || !preferredPosition.trim()) {
         setAlertMessage("Please complete the build name and preferred position.");
         setShowAlert(true);
         return;
      }

      setShowAlert(false);
      setAlertMessage("");
      setIsSubmitting(true);

      try {
         const response = await apiFetch(`/builds/updateFriendBuild?build_id=${selectedFriendBuildId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
            build_name: buildName.trim(),
            preferred_position: preferredPosition.trim(),}),
         });

         const responseText = await response.text();
            let data = null;

            if (responseText) {
               try {
                  data = JSON.parse(responseText);
               } catch {
                  data = null;
               }
            }

            if (!response.ok) {
               setAlertMessage(data?.detail || `Update failed (${response.status}).`);
               setShowAlert(true);
               return;
            }

            const buildListResponse = await apiFetch('/builds/friendsBuilds');
            
            if (!buildListResponse.ok) {
               setAlertMessage("Build updated successfully, but the builds list could not be reloaded.");
               setShowAlert(true);
               return;
            }

            const updatedBuilds = await buildListResponse.json();
            
            if (setBuilds) {
               setBuilds(updatedBuilds);
            }

            const friendsListResponse = await apiFetch('/friends/myFriends');
            
            if (!friendsListResponse.ok) {
               setAlertMessage("Build updated successfully, but the friends list could not be reloaded.");
               setShowAlert(true);
               return;
            }

            const updatedFriends = await friendsListResponse.json();
            setFriends(updatedFriends);
            onClose();

         } catch (error) {
            console.error('Error updating build:', error);
            setAlertMessage("An error occurred while updating the build.");
            setShowAlert(true);
         } finally {
            setIsSubmitting(false);
         }
      };


   return (
      <Container>
         {/* Header */}
         <Row>
            <Card className="hero-card mb-4">
               <div className="hero-glow hero-glow-top-right"></div>
               <div className="hero-glow hero-glow-top-left"></div>

               <Card.Body className="hero-content text-white">
                  <h1 className="justify-content-center" style={{ color: "rgba(255, 102, 0, 0.95)" }}>Edit Friends</h1>
                  <p className="fw-light">Select a friend to begin editing. Once you have finished, click save to continue.</p>
               </Card.Body>
            </Card>
         </Row>

         <Row>
            <Card className="hero-card mb-4">
               <div className="hero-glow hero-glow-top-right"></div>
               <div className="hero-glow hero-glow-top-left"></div>

               <Card.Body className="hero-content text-white">
                  <Form id="editFriendForm" method="post">

                     {/* Selecting friend to edit */}
                     <Row className="mb-3">
                        <Form.Label htmlFor="selectedFriend" className="text-start">Friend</Form.Label>
                        <Form.Select
                           className="bg-dark text-white border-secondary"
                           value={selectedFriendId}
                           onChange={handleFriendSelection}
                           id="selectedFriend"
                           required
                        >
                           <option value="">Friend</option>
                           {friends.map((friend) => (
                              <option key={friend.id} value={friend.id}>
                                 {friend.name}
                              </option>
                           ))}
                        </Form.Select>
                     </Row>

                     {/* Selecting what part of the friend to edit */}
                     {selectedFriendId !== "" && (
                        <Row className="mb-3">
                           <Form.Label htmlFor="updateOption" className="text-start">Requested Update</Form.Label>
                           <Form.Select
                              className="bg-dark text-white border-secondary"
                              value={updateOption}
                              onChange={handleUpdateOption}
                              id="updateOption"
                              required
                           >
                              <option value="">Requested Update</option>
                              <option value="friend">Friend details</option>
                              <option value="add_build">Add Build</option>
                              <option value="edit_build">Edit Build</option>
                           </Form.Select>
                        </Row>
                     )}
                  </Form>
               </Card.Body>
            </Card>
         </Row>

         {/* Editing friend details */}
         {updateOption === "friend" && (
            <Row>
               <Card className="hero-card mb-4">
                  <div className="hero-glow hero-glow-top-right"></div>
                  <div className="hero-glow hero-glow-top-left"></div>

                  <Card.Body className="hero-content text-white">
                     <Form
                        id="editFriendForm"
                        method="post" 
                        onSubmit={handleFriendEditSubmit}
                     >

                        {/* Alert message */}
                        <Row
                           id="submissionAlert"
                           className={"alert alert-danger " + (showAlert ? '' : 'd-none')}
                           role="alert"
                        >
                           {alertMessage}
                        </Row>

                        {/* Friend name */}
                        <Row className="mb-3">
                           <Form.Label
                              htmlFor="friendName"
                              className="text-start"
                           >
                              Name
                           </Form.Label>

                           <Form.Control
                              className="bg-dark text-white border-secondary"
                              value={friendName}
                              onChange={(e) => setFriendName(e.target.value)}
                              type="text"
                              id="friendName"
                              required
                           />
                        </Row>

                        {/* Friend online ID */}
                        <Row className="mb-3">
                           <Form.Label
                              htmlFor="friendOnlineID"
                              className="text-start"
                           >
                              Online ID
                           </Form.Label>

                           <Form.Control
                              className="bg-dark text-white border-secondary"
                              value={friendOnlineID}
                              onChange={(e) => setFriendOnlineID(e.target.value)}
                              type="text"
                              id="friendOnlineID"
                              required
                           />
                        </Row>

                        {/* Submit button */}
                        <Button
                           type="submit"
                           className="btn btn-primary"
                           style={{ backgroundColor: "rgba(255, 102, 0, 0.95)", borderColor: "rgba(255, 102, 0, 0.95)" }}
                           id="confirmFriendButton"
                           disabled={isSubmitting}
                        >
                           {isSubmitting ? 'Updating friend...' : 'Update Friend'}
                        </Button>

                     </Form>
                  </Card.Body>
               </Card>
            </Row>
         )}

         {/* Adding Friend builds */}
         {updateOption === "add_build" && (
            <Row>
               <Card className="hero-card mb-4">
                  <div className="hero-glow hero-glow-top-right"></div>
                  <div className="hero-glow hero-glow-top-left"></div>

                  <Card.Body className="hero-content text-white">
                     <Form
                        id="addFriendBuild"
                        method="post"
                        onSubmit={handleBuildAddSubmit}
                     >

                        {/* Alert message */}
                        <Row
                           id="submissionAlert"
                           className={"alert alert-danger " + (showAlert ? '' : 'd-none')}
                           role="alert"
                        >
                           {alertMessage}
                        </Row>

                        {/* Build name */}
                        <Row className="mb-3">
                           <Form.Label 
                              htmlFor="buildName" 
                              className="text-start"
                           >
                              Build Name
                           </Form.Label>

                           <Form.Control
                              className="bg-dark text-white border-secondary"
                              value={buildName}
                              onChange={(e) => setBuildName(e.target.value)}
                              type="text"
                              id="buildName"
                              required
                           />
                        </Row>

                        {/* Preferred position */}
                        <Row className="mb-3">
                           <Form.Label 
                              htmlFor="preferredPosition" 
                              className="text-start"
                           >
                              Preferred Position
                           </Form.Label>

                           <Form.Select
                              className="bg-dark text-white border-secondary"
                              value={preferredPosition}
                              onChange={(e) => setPreferredPosition(e.target.value)}
                              id="preferredPosition"
                              required
                           >
                              <option value="">Select a position</option>
                              <option value="PG">Point Guard</option>
                              <option value="SG">Shooting Guard</option>
                              <option value="SF">Small Forward</option>
                              <option value="PF">Power Forward</option>
                              <option value="C">Center</option>
                           </Form.Select>
                        </Row>

                        {/* Submit button */}
                        <Button
                           type="submit"
                           className="btn btn-primary"
                           style={{ backgroundColor: "rgba(255, 102, 0, 0.95)", borderColor: "rgba(255, 102, 0, 0.95)" }}
                           id="addFriendBuildButton"
                           disabled={isSubmitting}
                        >
                           {isSubmitting ? 'Adding Build...' : 'Add Build'}
                        </Button>

                     </Form>
                  </Card.Body>
               </Card>
            </Row>
         )}

         {/* Editing Friend builds */}
         {updateOption === "edit_build" && (
            <Row>
               <Card className="hero-card mb-4">
                  <div className="hero-glow hero-glow-top-right"></div>
                  <div className="hero-glow hero-glow-top-left"></div>

                  <Card.Body className="hero-content text-white">

                     {/* Selecting Friends Build */}
                     <Row className="mb-3">
                        <Form.Label htmlFor="selectedFriendBuild" className="text-start">Build</Form.Label>

                        <Form.Select
                           className="bg-dark text-white border-secondary"
                           value={selectedFriendBuildId}
                           onChange={handleBuildEditSelection}
                           id="selectedFriendBuild"
                           required
                        >
                           <option value="">Builds</option>
                           {friendsBuilds.filter((build) => build.friend_id === selectedFriendId).map((build) => (
                                 <option key={build.id} value={build.id}>
                                    {build.build_name}
                                 </option>
                              ))}
                        </Form.Select>
                     </Row>

                     <Form
                        id="editFriendBuild"
                        method="post"
                        onSubmit={handleBuildEditSubmit}>

                        {/* Alert message */}
                        <Row
                           id="submissionAlert"
                           className={"alert alert-danger " + (showAlert ? '' : 'd-none')}
                           role="alert">
                           {alertMessage}
                        </Row>

                        {/* Build name */}
                        <Row className="mb-3">
                           <Form.Label 
                              htmlFor="buildName" 
                              className="text-start"
                           >
                              Build Name
                           </Form.Label>

                           <Form.Control
                              className="bg-dark text-white border-secondary"
                              value={buildName}
                              onChange={(e) => setBuildName(e.target.value)}
                              type="text"
                              id="buildName"
                              required
                           />
                        </Row>

                        {/* Preferred position */}
                        <Row className="mb-3">
                           <Form.Label 
                              htmlFor="preferredPosition" 
                              className="text-start"
                           >
                              Preferred Position
                           </Form.Label>

                           <Form.Select
                              className="bg-dark text-white border-secondary"
                              value={preferredPosition}
                              onChange={(e) => setPreferredPosition(e.target.value)}
                              id="preferredPosition"
                              required
                           >
                              <option value="">Select a position</option>
                              <option value="PG">Point Guard</option>
                              <option value="SG">Shooting Guard</option>
                              <option value="SF">Small Forward</option>
                              <option value="PF">Power Forward</option>
                              <option value="C">Center</option>
                           </Form.Select>
                        </Row>

                        {/* Submit button */}
                        <Button
                           type="submit"
                           className="btn btn-primary"
                           style={{ backgroundColor: "rgba(255, 102, 0, 0.95)", borderColor: "rgba(255, 102, 0, 0.95)" }}
                           id="editFriendBuildButton"
                           disabled={isSubmitting}>

                           {isSubmitting ? 'Editing Build...' : 'Edit Build'}
                        </Button>


                     </Form>
                  </Card.Body>
               </Card>
            </Row>
         )}


      </Container>
   );
}

export default EditFriend;