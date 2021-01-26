import React, {useEffect, useState} from "react";
import "./SearchVaccinatorResults.module.css"
import {CheckboxItem} from "../../FacilityFilterTab";
import TableContainer from "@material-ui/core/TableContainer";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableBody from "@material-ui/core/TableBody";
import Collapse from "@material-ui/core/Collapse";
import Box from "@material-ui/core/Box";
import Paper from "@material-ui/core/Paper";
import IconButton from "@material-ui/core/IconButton";
import TextField from "@material-ui/core/TextField";
import styles from "./SearchVaccinatorResults.module.css";
import {API_URL} from "../../../utils/constants";
import {useAxios} from "../../../utils/useAxios";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import Typography from "@material-ui/core/Typography";
import makeStyles from "@material-ui/core/styles/makeStyles";


export default function SearchVaccinatorResultsView({vaccinators, togglePopup, setTogglePopup, facilityCode, onSelectVaccinatorBasedOnCode}) {

    const axiosInstance = useAxios('');

    useEffect(() => {

    }, []);

    const useStyles = makeStyles((theme) => ({
        root: {
            '& .MuiTextField-root': {
                margin: theme.spacing(1),
                width: '25ch',
            },
        },
    }));

    function handleClose() {
        setTogglePopup(false)
    }

    function addVaccinator(vaccinator) {
        const editData = {
            "osid": vaccinator.osid,
            "programs": vaccinator.programs,
            "facilityIds": [...vaccinator.facilityIds, facilityCode]
        };

        axiosInstance.current.put(API_URL.VACCINATORS_API, [editData])
            .then(res => {
                if (res.status === 200) {
                    setTimeout(() => onSelectVaccinatorBasedOnCode(vaccinator.code), 2000);
                }
                else {
                    alert("Something went wrong while saving!");
                }
            }, (error) => {
                console.log(error);
                alert("Something went wrong while adding vaccinator!");
            });
    }

    function Row(props) {
        const classes = useStyles();
        const { row } = props;
        const [open, setOpen] = React.useState(false);
        const PersonalDetailsFields = [
            {
                "label": "Licence Number",
                "value": "code"
            },
            {
                "label": "Name",
                "value": "name",
            },
            {
                "label": "Mobile Number",
                "value": "mobileNumber"
            },
            {
                "label": "Email",
                "value": "email",
            },
            {
                "label": "National Identifier",
                "value": "nationalIdentifier"
            },
        ];

        return (
            <React.Fragment>
                <TableRow>
                    <TableCell component="th" scope="row">
                        {row.name}
                    </TableCell>
                    <TableCell>{row.mobileNumber}</TableCell>
                    <TableCell>{row.code}</TableCell>
                    <TableCell>
                        <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
                            <CheckboxItem
                                text=""
                                checked={open}
                                onSelect={() => setOpen(!open)}
                                showText={false}
                            />
                        </IconButton>
                    </TableCell>
                </TableRow>
                <TableRow>
                    <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                        <Collapse in={open} timeout="auto" unmountOnExit>
                            <Box margin={1}>
                                <div className={classes.root}>
                                    <div className="container">
                                        <Typography variant="h6" gutterBottom component="div">
                                            Personal Details
                                        </Typography>
                                        <div className="row">
                                            {
                                                PersonalDetailsFields.map(pd => (
                                                    <div>
                                                        <TextField
                                                            id="filled-read-only-input"
                                                            label={pd.label}
                                                            defaultValue={row[pd.value]}
                                                            InputProps={{
                                                                readOnly: true,
                                                            }}
                                                            variant="filled"
                                                        />
                                                    </div>
                                                ))
                                            }
                                        </div>
                                    </div>
                                    { (row.programs && row.programs.length > 0) &&
                                        <div className="container">
                                            <Typography variant="h6" gutterBottom component="div">
                                                Training & Certification
                                            </Typography>
                                            {
                                                row.programs &&
                                                    row.programs.map(p => (
                                                        <div className="row">
                                                            <div>
                                                                <TextField
                                                                    id="filled-read-only-input"
                                                                    label="Program"
                                                                    defaultValue={p.id}
                                                                    InputProps={{
                                                                        readOnly: true,
                                                                    }}
                                                                    variant="filled"
                                                                />
                                                            </div>
                                                            <div>
                                                                <TextField
                                                                    id="filled-read-only-input"
                                                                    label="Certification"
                                                                    defaultValue={p.certified ? "Certified": "Not Certified"}
                                                                    InputProps={{
                                                                        readOnly: true,
                                                                    }}
                                                                    variant="filled"
                                                                />
                                                            </div>
                                                        </div>
                                                    ))
                                            }
                                        </div>
                                    }
                                    <div className="container">
                                        <Typography variant="h6" gutterBottom component="div">
                                            Associated Facilities
                                        </Typography>
                                        <div className="row">
                                            {
                                                row.facilityIds.map(r => (
                                                    <div>
                                                        <TextField
                                                            id="filled-read-only-input"
                                                            label="facility Code"
                                                            defaultValue={r}
                                                            InputProps={{
                                                                readOnly: true,
                                                            }}
                                                            variant="filled"
                                                        />
                                                    </div>
                                                ))
                                            }
                                        </div>
                                    </div>
                                    <div className="container">
                                        <button className={styles['add-vaccinator-button']} onClick={() => addVaccinator(row)} >ADD VACCINATOR</button>
                                    </div>
                                </div>
                            </Box>
                        </Collapse>
                    </TableCell>
                </TableRow>
            </React.Fragment>
        );
    }

    return (
        <Dialog
            open={togglePopup}
            onClose={handleClose}
            maxWidth="lg"
            fullWidth={true}
        >
            <DialogTitle><span style={{ color: '#5C9EF8'}}>{vaccinators.length}</span> Results found in the Registry</DialogTitle>
            <DialogContent>
                <TableContainer component={Paper}>
                    <Table aria-label="collapsible table table-hover v-table-data">
                        <TableHead>
                            <TableRow>
                                <TableCell>OPERATOR NAME</TableCell>
                                <TableCell>MOBILE NUMBER</TableCell>
                                <TableCell>LICENSE NUMBER</TableCell>
                                <TableCell />
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {vaccinators.map((row) => (
                                <Row key={row.code} row={row} />
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </DialogContent>
        </Dialog>
    );

}
