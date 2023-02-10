package services.db.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import controllers.Application;

public class Debt {

    @JsonProperty("firstname")
    private String firstname;
    @JsonProperty("lastname")
    private String lastname;
    @JsonProperty("email")
    private String email;
    @JsonProperty("address")
    private String address;
    @JsonProperty("city")
    private String city;
    @JsonProperty("state")
    private String state;
    @JsonProperty("zip")
    private String zip;
    @JsonProperty("phone")
    private String phone;
    @JsonProperty("gender")
    private String gender;
    @JsonProperty("site")
    private String WWW;

    @JsonProperty("create_date")
    private String createStrDate;

    @JsonProperty("ip")
    private String ip;

    private Integer ST_CODE;

    private long date;

    private String COUNTY;

    private Integer ZIP_CODE;

    private Integer AREA_CODE;

    private Boolean dnc;

    private String data;

    private Integer phoneType;

    private Long TIMESTAMP;


    public Debt() {
    }

    public String getCreateStrDate() {
        return createStrDate;
    }

    public void setCreateStrDate(String createStrDate) {
        this.createStrDate = createStrDate;
    }

    public String getCOUNTY() {
        return COUNTY;
    }

    public void setCOUNTY(String COUNTY) {
        this.COUNTY = COUNTY;
    }

    public String getWWW() {
        return WWW;
    }

    public void setWWW(String WWW) {
        this.WWW = WWW;
    }

    public String getFirstname() {
        return firstname;
    }

    public Long getTIMESTAMP() {
        return TIMESTAMP;
    }

    public void setTIMESTAMP(Long TIMESTAMP) {
        this.TIMESTAMP = TIMESTAMP;
    }

    public void setFirstname(String firstname) {
        this.firstname = firstname;
    }

    public String getLastname() {
        return lastname;
    }

    public void setLastname(String lastname) {
        this.lastname = lastname;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getZip() {
        return zip;
    }

    public void setZip(String zip) {
        this.zip = zip;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public long getDate() {
        return date;
    }

    public void setDate(long date) {
        this.date = date;
    }

    public String getIp() {
        return ip;
    }

    public void setIp(String ip) {
        this.ip = ip;
    }

    public Integer getST_CODE() {
        if (state != null) {
            for (int i = 0; i < Application.STATE_CODES.length; i++) {
                if (state.equals(Application.STATE_CODES[i])) {
                    return i;
                }
            }
        }

        return null;
    }

    public void setST_CODE(Integer ST_CODE) {
        this.ST_CODE = ST_CODE;
    }

    public Integer getZIP_CODE() {
        if (zip != null) {
            try {
                return Integer.parseInt(zip.split("-")[0]);
            } catch (Exception e) { /*noop*/ }
        }

        return null;
    }

    public void setZIP_CODE(Integer ZIP_CODE) {
        this.ZIP_CODE = ZIP_CODE;
    }

    public Integer getAREA_CODE() {
        if (phone == null || phone.length() == 0) {
            return null;
        } else {
            try {
                return Integer.parseInt(phone.substring(0, 3));
            } catch (Exception e) {
                return null;
            }
        }
    }

    public void setAREA_CODE(Integer AREA_CODE) {
        this.AREA_CODE = AREA_CODE;
    }

    public Boolean getDnc() {
        return dnc;
    }

    public void setDnc(Boolean dnc) {
        this.dnc = dnc;
    }

    public String getData() {
        return data;
    }

    public void setData(String data) {
        this.data = data;
    }

    public Integer getPhoneType() {
        return phoneType;
    }

    public void setPhoneType(Integer phoneType) {
        this.phoneType = phoneType;
    }
}
