// updating player data
function updatePlayerData(data) {
  return db.ref("webGame/" + playerID).update(data);
}

// callout player data
function getPlayerData(callback) {
  db.ref("webGame/" + playerID).on("value", (snapshot) => {
    callback(snapshot.val());
  });
}

// remove player data
function removePlayerData() {
  return db.ref("webGame/" + playerID).remove();
}

// guest to permanent
function convertToPermanent(userInfo) {
  return db.ref("webGame/" + playerID).update({
    ...userInfo,
    temporary: false,
    savedAt: Date.now()
  });
}

// check admin mode
function isAdminMode(callback) {
  if (!playerID) return callback(false);

  db.ref("webGame/" + playerID + "/adminMode").once("value")
    .then(snapshot => callback(snapshot.val() === true))
    .catch(() => callback(false));
}

window.isAdminMode = isAdminMode;
window.updatePlayerData = updatePlayerData;
window.getPlayerData = getPlayerData;
window.removePlayerData = removePlayerData;
window.convertToPermanent = convertToPermanent;