import * as functions from "firebase-functions";
const admin = require("firebase-admin");
admin.initializeApp(functions.config().firebase);


exports.getSSCDeals = functions.https.onRequest((req, res) => {
  console.log(req.body);
  const body = req.body;
  const deal = {
    businessName: body.businessName,
    businessId: body.businessId,
    maxUses: body.maxUses,
    extraDetails: body.extraDetails,
    deal: body.deal,
    imageUrl: body.imageUrl,
    categoryId: body.categoryId,
    locations: body.locations.map((l: any) => {return {lat: l[1], long: l[0]}}),
    id: body.sscId
  }
  console.log(deal);
  admin.firestore().doc(`deals/${deal.id}`).set(deal).then(() => {
    res.status(200).send("Success");
  });
});