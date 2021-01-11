package pkg

import (
	"github.com/divoc/kernel_library/services"
	"github.com/divoc/portal-api/config"
	"github.com/divoc/portal-api/pkg/db"
	"github.com/divoc/portal-api/swagger_gen/models"
	"github.com/pkg/errors"
	log "github.com/sirupsen/logrus"
	"strconv"
	"strings"
)

type FacilityCSV struct {
	CSVMetadata
}

func (facilityCsv FacilityCSV) CreateCsvUploadHistory() *db.CSVUploads {
	return facilityCsv.CSVMetadata.CreateCsvUploadHistory("Facility")
}

func (facilityCsv FacilityCSV) ValidateRow() []string {
	requiredHeaders := strings.Split(config.Config.Facility.Upload.Required, ",")
	return facilityCsv.CSVMetadata.ValidateRow(requiredHeaders)
}

func (facilityCsv FacilityCSV) CreateCsvUpload() error {
	data := facilityCsv.Data
	serialNum, err := strconv.ParseInt(data.Text("serialNum"), 10, 64)
	if err != nil {
		return err
	}
	addressline1 := data.Text("addressLine1")
	addressline2 := data.Text("addressLine2")
	district := data.Text("district")
	state := data.Text("state")
	pincode := data.int64("pincode")
	facility := models.Facility{
		SerialNum:          serialNum,
		FacilityCode:       data.Text("facilityCode"),
		FacilityName:       data.Text("facilityName"),
		Contact:            data.Text("contact"),
		OperatingHourStart: data.int64("operatingHourStart"),
		OperatingHourEnd:   data.int64("operatingHourEnd"),
		Category:           data.Text("category"),
		Type:               data.Text("type"),
		Status:             data.Text("status"),
		Admins:             strings.Split(data.Text("admins"), ","),
		Address: &models.Address{
			AddressLine1: &addressline1,
			AddressLine2: &addressline2,
			District:     &district,
			State:        &state,
			Pincode:      &pincode,
		},
	}
	err = services.CreateNewRegistry(facility, "Facility")
	if err != nil {
		errmsg := err.Error()
		if strings.Contains(errmsg, "Detail:") {
			split := strings.Split(errmsg, "Detail:")
			if len(split) > 0 {
				m1 := split[len(split)-1]
				return errors.New(m1)
			}
		}
		return errors.New(errmsg)
	}

	for _, mobile := range facility.Admins {
		//create keycloak user for
		log.Infof("Creating administrative login for the facility :%s [%s]", facility.FacilityName, mobile)
		userRequest := KeyCloakUserRequest{
			Username: mobile,
			Enabled:  "true",
			Attributes: KeycloakUserAttributes{
				MobileNumber: []string{mobile},
				FacilityCode: facility.FacilityCode,
			},
		}

		resp, err := CreateKeycloakUser(userRequest)
		log.Infof("Create keycloak user %+v", resp)
		if err != nil || !isUserCreatedOrAlreadyExists(resp) {
			log.Errorf("Error while creating keycloak user : %s", mobile)
			return errors.New("Error while creating keycloak user : " + mobile)
		} else {
			log.Info("Setting up roles for the user ", mobile)
			keycloakUserId := getKeycloakUserId(resp, userRequest)
			if keycloakUserId != "" {
				_ = addUserToGroup(keycloakUserId, config.Config.Keycloak.FacilityAdmin.GroupId)
			} else {
				log.Error("Unable to map keycloak user id for ", mobile)
				return errors.New("Unable to map keycloak user id for " + mobile)
			}
		}

	}
	return nil
}

func (facilityCsv FacilityCSV) SaveCsvErrors(rowErrors []string, csvUploadHistoryId uint) {
	facilityCsv.CSVMetadata.SaveCsvErrors(rowErrors, csvUploadHistoryId)
}