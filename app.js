const express = require("express");
const axios = require("axios");
const JSEncrypt = require("nodejs-jsencrypt").default;
const crypt = new JSEncrypt();
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;
const NEXIO_API_USER = process.env.NEXIO_API_USER;
const NEXIO_API_KEY = process.env.NEXIO_API_KEY;
const NEXIO_API_BASE_URL = process.env.NEXIO_API_BASE_URL;

const publicKey =
  "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAvWpIQFjQQCPpaIlJKpeg irp5kLkzLB1AxHmnLk73D3TJbAGqr1QmlsWDBtMPMRpdzzUM7ZwX3kzhIuATV4Pe 7RKp3nZlVmcrT0YCQXBrTwqZNh775z58GP2kZs+gVfNqBampJPzSB/hB62KkByhE Cn6grrRjiAVwJyZVEvs/2vrxaEpO+aE16emtX12RgI5JdzdOiNyZEQteU6zRBRJE ocPWVxExaOpVVVJ5+UnW0LcalzA+lRGRTrQJ5JguAPiAOzRPTK/lYFFpCAl/F8wt oAVG1c8zO2NcQ0Pko+fmeidRFxJ/did2btV+9Mkze3mBphwFmvnxa35LF+Cs/XJHDwIDAQAB";

const encrypt = (message) => {
  crypt.setKey(publicKey);
  return crypt.encrypt(message) || message;
};

const logResponsePretty = (response) => {
  if (response.status === 200) {
    console.log(`Transaction successful: ${JSON.stringify(response.data, null, 2)}`);
  }
}

app.use(express.json());

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const axiosInstance = axios.create({
  baseURL: NEXIO_API_BASE_URL,
  headers: {
    Authorization: `Basic ${Buffer.from(
      NEXIO_API_USER + ":" + NEXIO_API_KEY
    ).toString("base64")}`,
    "Content-Type": "application/json",
  },
});

app.post("/api/payment", async (req, res) => {
  try {
    const {
      cardNumber,
      currency,
      amount,
      expirationMonth,
      expirationYear,
      cardType,
      cardHolderName,
      securityCode,
    } = req.body;

    const savedToken = await axiosInstance.post("/pay/v3/token", {
      data: { currency: currency },
      processingOptions: {
        checkFraud: true,
        verboseResponse: false,
        verifyAvs: 0,
        verifyCvc: false,
      },
      shouldUpdateCard: true,
      uiOptions: {
        displaySubmitButton: false,
        hideBilling: {
          hideAddressOne: false,
          hideAddressTwo: false,
          hideCity: false,
          hideCountry: false,
          hidePostal: false,
          hidePhone: true,
          hideState: false,
        },
        hideCvc: false,
        requireCvc: true,
        forceExpirationSelection: true,
      },
    });
    var ecNumber = encrypt(cardNumber);

    const savedCard = await axiosInstance.post("/pay/v3/saveCard", {
      card: {
        cardHolderName: cardHolderName,
        encryptedNumber: ecNumber,
        expirationMonth,
        expirationYear,
      },
      token: savedToken.data.token,
    });
    const response = await axiosInstance.post("/pay/v3/process", {
      data: { currency, amount },
      paymentMethod: "card",
      tokenex: { token: savedCard.data.token.token },
      card: {
        expirationMonth,
        expirationYear,
        cardType,
        cardHolderName,
        securityCode,
      },
    });
    logResponsePretty(response);
    res.json(response.data);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error processing payment", error: error.message });
  }
});

app.get('/api/transactions', async (req, res) => {
  try {
    const params = new URLSearchParams(req.params);
    const response = await axiosInstance.get('/transaction/v3', {
      params
    });
    logResponsePretty(response);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching transactions', error: error.message });
  }
})