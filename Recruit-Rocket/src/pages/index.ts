export * from './home'
export * from './forgotPassword'
export * from './login'
export * from './register'
export * from './company/list'
export * from './company/create'
export * from './company/edit'
export * from './values'
// Remove or comment out this line if the file doesn't exist
// export * from "./applicant/edit";

// If ApplicantEditPage is in the company folder, add this line:
export { default as ApplicantEditPage } from './company/edit'