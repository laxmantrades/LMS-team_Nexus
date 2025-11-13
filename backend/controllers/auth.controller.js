export const logoutUser = async (req, res) => {
    try {
      
      res.clearCookie("token", {
        httpOnly: true,
        secure: false,   
        sameSite: "Lax", 
      });
  
      return res.status(200).json({
        success: true,
        message: "Logged out successfully",
      });
    } catch (err) {
      console.error("logoutUser error:", err);
      return res
        .status(500)
        .json({ success: false, message: "Server error during logout" });
    }
  };