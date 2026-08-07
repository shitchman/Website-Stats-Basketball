import { useEffect } from "react";

function AddGames() {

    useEffect(() => {
        document.title = "Hoop Stats - Add Games";
    }, []);

    return (
        <div className="row justify-content-center">

            <div className="container">
                <h1>Users profile</h1>
            </div>

            <div>
                <p>They can see their builds and friends here.  Can add builds and friends here as well as edit their own and their friends profiles.  Friends profiles will inclue nickname, online id and build list.</p>
            </div>
        </div>
    );

}

export default AddGames;