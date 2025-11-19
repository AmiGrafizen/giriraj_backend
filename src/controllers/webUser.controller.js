import webUserService from "../services/webUser.service.js";


const registerUser = async (req, res) => {
  try {
    const user = await webUserService.registerUserService(req.body);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: user,
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: "identifier (email/phone) and password required",
      });
    }

    const { user, token } = await webUserService.loginUserService(
      identifier,
      password
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      data: {
        id: user._id,
        userId: user.userId,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const saveHospitalProfile = async (req, res) => {
  try {
    const userId = req.body.userId;  // ✅ now reading from body

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    const { 
      hospitalName, 
      address, 
      languages, 
      contact, 
      email, 
      website, 
      logo, 
      favicon 
    } = req.body;

    const data = {
      hospitalName,
      address,
      languages: Array.isArray(languages) ? languages : JSON.parse(languages || "[]"),
      contact,
      email,
      website,
      logo: logo || null,
      favicon: favicon || null,
      createdBy: userId,
      updatedBy: userId
    };

    const result = await webUserService.saveHospitalProfileService(data, userId);

    res.status(200).json({
      success: true,
      message: "Hospital profile saved successfully",
      data: result,
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


const getHospitalProfile = async (req, res) => {
  try {
    const userId = req.params?.userId;
    console.log('userId', userId)

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: userId missing",
      });
    }

    const profile = await webUserService.getHospitalProfileService(userId);

    res.status(200).json({
      success: true,
      data: profile,
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};  


const saveDashboardTitles = async (req, res) => {
  try {
    const { userId, titles } = req.body;

    if (!userId)
      return res.status(400).json({ success: false, message: "userId required" });

    const result = await webUserService.saveDashboardTitlesService(userId, titles);

    res.json({
      success: true,
      message: "Dashboard titles saved",
      data: result
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getDashboardTitles = async (req, res) => {
  try {
    const userId = req.query.userId;

    const titles = await webUserService.getDashboardTitlesService(userId);

    res.json({
      success: true,
      data: titles
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const saveWebUserSettings = async (req, res) => {
  try {
    const userId = req.body?.userId || req.user?.id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    const saved = await webUserService.saveWebUserSettingsService(
      userId,
      req.body
    );

    res.status(200).json({
      success: true,
      message: "Settings saved successfully",
      data: saved,
    });
  } catch (err) {
    console.error("SAVE SETTINGS ERROR:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Something went wrong",
    });
  }
};

const getWebUserSettings = async (req, res) => {
  try {
    const userId = req.params?.userId || req.user?.id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is missing",
      });
    }

    const settings = await webUserService.getWebUserSettingsService(
      userId
    );

    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (err) {
    console.error("GET SETTINGS ERROR:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const saveOPDSettingsController = async (req, res) => {
  try {
    const userId = req.body?.userId || req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized: userId missing" });
    }

    const data = await webUserService.saveOPDSettingsService(userId, req.body);

    res.status(200).json({
      success: true,
      message: "OPD Setup saved successfully",
      data
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getOPDSettingsController = async (req, res) => {
  try {
     const userId = req.params?.userId || req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized: userId missing" });
    }

    const data = await webUserService.getOPDSettingsService(userId);

    res.status(200).json({
      success: true,
      data
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


export default {
  registerUser, loginUser, saveHospitalProfile, getHospitalProfile, getDashboardTitles, saveDashboardTitles, saveWebUserSettings, getWebUserSettings,
  saveOPDSettingsController, getOPDSettingsController,
};
