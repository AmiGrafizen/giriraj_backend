import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { girirajModels } from "../db/index.js";

/* UNIVERSAL MODEL FINDER */
function getModel(modelName) {
  if (!girirajModels || typeof girirajModels !== "object") {
    console.error("❌ girirajModels not initialized or invalid");
    return null;
  }

  const keys = Object.keys(girirajModels);
  if (!keys.length) {
    console.error("⚠️ No models loaded in girirajModels");
    return null;
  }

  const target = modelName.toLowerCase();

  const foundKey = keys.find(
    (k) =>
      k.toLowerCase() === target ||
      k.toLowerCase().includes(target)
  );

  if (!foundKey) {
    console.warn(`⚠️ Model "${modelName}" not found. Available:`, keys);
    return null;
  }

  let model = girirajModels[foundKey];

  // unwrap safely
  if (model && typeof model.find !== "function") {
    model = model.primary || model.secondary || model.default || model.model;
  }

  if (!model || typeof model.find !== "function") {
    console.error(`❌ Invalid Mongoose model: ${foundKey}`, model);
    return null;
  }

  console.log(`✅ Using model: ${foundKey}`);
  return model;
}


function generateUserId(fullName) {
  const parts = fullName.trim().split(" ");
  const first = parts[0].charAt(0).toUpperCase();
  const last = parts[parts.length - 1].charAt(0).toUpperCase();
  const random = Math.floor(100000 + Math.random() * 900000);
  return `${first}${last}-${random}`;
}

async function registerUserService(data) {
  const WebUser = getModel("GIRIRAJWebUser");
  if (!WebUser) throw new Error("GIRIRAJWebUser model not found");

  const { fullName, email, phone, password, role } = data;

  // check duplicates
  const existing = await WebUser.findOne({
    $or: [{ email }, { phone }],
  });
  if (existing) throw new Error("Email or phone already exists");

  const hashedPassword = await bcrypt.hash(password, 10);

  let userId = generateUserId(fullName);
  while (await WebUser.findOne({ userId })) {
    userId = generateUserId(fullName);
  }

  const newUser = await WebUser.create({
    fullName,
    email,
    phone,
    password: hashedPassword,
    role,
    userId,
  });

  return newUser;
}

async function loginUserService(identifier, password) {
  const WebUser = getModel("GIRIRAJWebUser");
  if (!WebUser) throw new Error("GIRIRAJWebUser model not found");

  const user = await WebUser.findOne({
    $or: [{ email: identifier }, { phone: identifier }],
  });
  if (!user) throw new Error("User not found");

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new Error("Invalid password");

  const token = jwt.sign(
    {
      id: user._id,
      userId: user.userId,
      fullName: user.fullName,
      role: user.role,
      email: user.email,
      phone: user.phone,
    },
    process.env.JWT_SECRET || "secretKey123",
    { expiresIn: "7d" }
  );

  return { user, token };
}

async function saveHospitalProfileService(data, userId) {
  const HospitalProfile = getModel("GIRIRAJHospitalProfile");
  if (!HospitalProfile) throw new Error("GIRIRAJHospitalProfile model not found");

  // Check if profile already exists for this user
  const existing = await HospitalProfile.findOne({ userId });

  if (existing) {
    // Update existing profile
    return await HospitalProfile.findOneAndUpdate(
      { userId },
      { ...data },
      { new: true }
    );
  }

  // Create new profile
  return await HospitalProfile.create({
    ...data,
    userId,
  });
}

async function getHospitalProfileService(userId) {
  const HospitalProfile = getModel("GIRIRAJHospitalProfile");
  if (!HospitalProfile) throw new Error("GIRIRAJHospitalProfile model not found");

  return await HospitalProfile.findOne({ userId });
}

 async function saveDashboardTitlesService(userId, titles) {
  const Titles = getModel("GIRIRAJDashboardTitles");

  let existing = await Titles.findOne({ userId });

  if (existing) {
    existing.titles = titles;
    return await existing.save();
  }

  return await Titles.create({
    userId,
    titles,
  });
}

async function getDashboardTitlesService(userId) {
  const Titles = getModel("GIRIRAJDashboardTitles");
  const record = await Titles.findOne({ userId });
  return record?.titles || {};
}


function mapWithUserId(userId, arr) {
  if (!arr) return [];

  if (!Array.isArray(arr)) {
    return [{ ...arr, userId }];
  }

  return arr.map((item) => ({
    ...item,
    userId,
  }));
}

  async function saveWebUserSettingsService(userId, body) {
    const Settings = getModel("GIRIRAJIPDSetup");
    if (!Settings) throw new Error("Web User Settings model not found");

    let existing = await Settings.findOne({ userId });

    // Format all sections with userId included
    const formattedData = {
      selectedLanguages: body.selectedLanguages || [],
      basic: body.basic || {},
      welcomeScreen: mapWithUserId(userId, body.welcomeScreen || []),
      personalDetails: mapWithUserId(userId, body.personalDetails || []),
      feedbackConcerns: mapWithUserId(userId, body.feedbackConcerns || []),
      concernDetails: mapWithUserId(userId, body.concernDetails || []),
      ratingPage: mapWithUserId(userId, body.ratingPage || []),
      npsPage: mapWithUserId(userId, body.npsPage || []),
      thankYouModal: mapWithUserId(userId, body.thankYouModal || []),
    };

    if (existing) {
      Object.assign(existing, formattedData);
      return await existing.save();
    }

    return await Settings.create({
      userId,
      ...formattedData,
    });
  }

  async function getWebUserSettingsService(userId) {
    const Settings = getModel("GIRIRAJIPDSetup");
    if (!Settings) throw new Error("Web User Settings model not found");

    const settings = await Settings.findOne({ userId });
    return settings || {};
  }

  async function saveOPDSettingsService(userId, body) {
  const Settings = getModel("GIRIRAJOPDSetup");
  if (!Settings) throw new Error("OPD Setup model not found");

  let existing = await Settings.findOne({ userId });

  const formattedData = {
    selectedLanguages: body.selectedLanguages || [],
    basic: body.basic || {},

    welcomeScreen: mapWithUserId(userId, body.welcomeScreen),
    personalDetails: mapWithUserId(userId, body.personalDetails),
    complaintDetails: mapWithUserId(userId, body.complaintDetails),
    ratingPage: mapWithUserId(userId, body.ratingPage),
    npsPage: mapWithUserId(userId, body.npsPage),
    thankYouModal: mapWithUserId(userId, body.thankYouModal)
  };

  if (existing) {
    Object.assign(existing, formattedData);
    return await existing.save();
  }

  return await Settings.create({
    userId,
    ...formattedData
  });
}

async function getOPDSettingsService(userId) {
  const Settings = getModel("GIRIRAJOPDSetup");
  if (!Settings) throw new Error("OPD Setup model not found");

  const settings = await Settings.findOne({ userId });
  return settings || {};
}


export default {
  registerUserService,loginUserService,saveHospitalProfileService,getHospitalProfileService, saveDashboardTitlesService, getDashboardTitlesService,
  saveWebUserSettingsService, getWebUserSettingsService, saveOPDSettingsService, getOPDSettingsService,
};
