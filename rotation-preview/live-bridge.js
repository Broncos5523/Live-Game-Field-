'use strict';
window.receiveApproved=async snapshot=>{await window.renderApprovedLive(snapshot);await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));window.ManCaveTeamRecords?.['live']?.(snapshot);return true;};
