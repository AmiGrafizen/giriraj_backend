import axios from 'axios';

export const sendWhatsappOTP = async ({ to, otp }) => {
    const API_TOKEN = '9055|r6DSgBtWzZMg4JtsaEGfiq305zIUsmimjxix32V3';
    const PHONE_NUMBER_ID = '459879443881302';
    const TEMPLATE_ID = '173927';

    try {
        // const url = `https://chattrbox.in/api/v1/whatsapp/send/template?apiToken=${API_TOKEN}&phone_number_id=${PHONE_NUMBER_ID}&template_id=${TEMPLATE_ID}&phone_number=91${to}`;
       const url =  `https://chat.grafizen.com/api/v1/whatsapp/send/template?apiToken=${API_TOKEN}&phone_number_id=${PHONE_NUMBER_ID}&template_id=${TEMPLATE_ID}&template_quick_reply_button_values=%5B%22EXTERNAL_ECOMMERCE_CONFIRM_ORDER%22%5D&templateVariable-otp-1=${otp}&templateVariable-otp-2=${otp}&phone_number=91${to}`;

        const response = await axios.post(url, {
            channelId: "651fa2f26e72bfe4b787df50",
            channelType: "whatsapp",
            recipient: {
                mobileNumber: "91" + to,
            },
            whatsapp: {
                type: "template",
                templateId: TEMPLATE_ID,
                template: {
                    templateName: "otp",
                    templateVariables: {
                        "OTP": otp
                    }
                }
            },
        }, {
            headers: {
                'Content-Type': 'application/json',
            }
        });

        
    return {
        success: true,
        data: {
          ...response.data,
          otp  
        }
      };
  
    } catch (error) {
        return {
            success: false,
            message: error?.response?.data?.message || "OTP send failed",
            error: error?.response?.data || error.message
        };
    }
};

