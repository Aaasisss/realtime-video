import {
  doc,
  collection,
  addDoc,
  setDoc,
  onSnapshot,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { firestoreDB } from "./initFirebase";
import { useEffect } from "react";

const useCallOps = () => {
  const servers = {
    iceServers: [
      {
        urls: [
          "stun:stun1.l.google.com:19302",
          "stun:stun2.l.google.com:19302",
        ],
      },
    ],
    iceCandidatePoolSize: 10,
  };

  const peerConnection = new RTCPeerConnection(servers);
  let localStream: MediaStream | null = null;
  let remoteStream: MediaStream | null = null;

  console.log("localStream", localStream);
  useEffect(() => {
    console.log("remoteStream", remoteStream);
  }, [remoteStream]);

  const startANewCall = async () => {
    // element references
    const localVideoElement = document.getElementById(
      "localVideoElement"
    ) as HTMLVideoElement;
    const remoteVideoElement = document.getElementById(
      "remoteVideoElement"
    ) as HTMLVideoElement;

    localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    remoteStream = new MediaStream();

    localStream.getTracks().forEach((track) => {
      peerConnection.addTrack(track, localStream!);
    });

    peerConnection.ontrack = (event) => {
      console.log("ontrack event triggered", event);

      event.streams[0].getTracks().forEach((track) => {
        console.log("Adding track to remoteStream", track);
        remoteStream?.addTrack(track);
      });
    };
    remoteVideoElement.srcObject = remoteStream;
    localVideoElement.srcObject = localStream;
  };

  const joinACall = async () => {
    // Reference Firestore collections for signaling
    const callDocs = doc(collection(firestoreDB, "calls"));
    const offerCandidates = collection(callDocs, "offerCandidates");
    const answerCandidates = collection(callDocs, "answerCandidates");
    const joinACallInput = document.getElementById(
      "joinACallInput"
    ) as HTMLInputElement;
    joinACallInput.value = callDocs.id;

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        addDoc(offerCandidates, event.candidate.toJSON());
      }
    };

    const offerDescription = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offerDescription);

    const offer = {
      sdp: offerDescription.sdp,
      type: offerDescription.type,
    };

    await setDoc(callDocs, { offer });

    onSnapshot(callDocs, async (snapshot) => {
      const data = snapshot.data();
      console.log("create offer data", data);

      console.log("peerConnection", peerConnection);

      if (!peerConnection.currentRemoteDescription && data?.answer) {
        const answerDescription = new RTCSessionDescription(data.answer);
        console.log("createOffer answerDescription", answerDescription);

        try {
          await peerConnection.setRemoteDescription(answerDescription);
        } catch (error) {
          console.error("Failed to set remote description", error);
        }
      }
    });

    onSnapshot(answerCandidates, (snapshot) => {
      console.log("adding candidate to peer connection");

      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const newCandidate = new RTCIceCandidate(change.doc.data());
          peerConnection.addIceCandidate(newCandidate);
        }
      });
    });
  };

  const answerCall = async () => {
    const joinACallInput = document.getElementById(
      "joinACallInput"
    ) as HTMLInputElement;
    const docId = joinACallInput.value;

    // Reference Firestore collections for signaling
    const currentCallDoc = doc(collection(firestoreDB, "calls"), docId);
    const offerCandidates = collection(currentCallDoc, "offerCandidates");
    const answerCandidates = collection(currentCallDoc, "answerCandidates");

    console.log("docId", docId);

    peerConnection.onicecandidate = (event) => {
      if (event?.candidate) {
        addDoc(answerCandidates, event.candidate.toJSON());
      }
    };

    const callData = (await getDoc(currentCallDoc)).data();
    console.log("callData", callData);

    const offerDescription = callData?.offer;
    console.log("remote offer description", offerDescription);

    await peerConnection.setRemoteDescription(
      new RTCSessionDescription(offerDescription)
    );

    const answerDescription = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answerDescription);

    const answer = {
      sdp: answerDescription.sdp,
      type: answerDescription.type,
    };

    await updateDoc(currentCallDoc, { answer });

    onSnapshot(offerCandidates, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const data = change.doc.data();
          const newCandidate = new RTCIceCandidate(data);

          peerConnection.addIceCandidate(newCandidate);
        }
      });
    });
  };

  return {
    pc: peerConnection,
    localStream,
    remoteStream,
    startANewCall,
    joinACall,
    answerCall,
  };
};

export default useCallOps;
