import gql from "graphql-tag";

// Mutation to update user
export const UPDATE_USER_MUTATION = gql`
  # The ! after the type means that it is required
  mutation UpdateUser($input: UpdateOneUserInput!) {
    # call the updateOneUser mutation with the input and pass the $input argument
    # $variableName is a convention for GraphQL variables
    updateOneUser(input: $input) {
      id
      name
      avatarUrl
      email
      phone
      jobTitle
    }
  }
`;

// Mutation to create company
export const CREATE_COMPANY_MUTATION = gql`g
  mutation CreateCompany($input: CreateOneCompanyInput!) {
    createOneCompany(input: $input) {
      id
      salesOwner {
        id
      }
    }
  }
`;

// Mutation to update company details
export const UPDATE_COMPANY_MUTATION = gql`
  mutation UpdateCompany($input: UpdateOneCompanyInput!) {
    updateOneCompany(input: $input) {
      id
      name
      totalRevenue
      industry
      companySize
      businessType
      country
      website
      avatarUrl
      salesOwner {
        id
        name
        avatarUrl
      }
    }
  }
`;

// Mutation to update task stage of a task
export const UPDATE_TASK_STAGE_MUTATION = gql`
  mutation UpdateTaskStage($input: UpdateOneTaskInput!) {
    updateOneTask(input: $input) {
      id
    }
  }
`;

// Mutation to create a new task
export const CREATE_TASK_MUTATION = gql`
  mutation CreateTask($input: CreateOneTaskInput!) {
    createOneTask(input: $input) {
      id
      title
      stage {
        id
        title
      }
    }
  }
`;

export const CREATE_EVENT_MUTATION = gql`
  mutation CreateOneEvent($input: CreateOneEventInput!) {
    createOneEvent(input: $input) {
      id
      title
      startDate
      endDate
      description
      categoryId
      participantIds
      color
      userId
    }
  }
`;

export const DELETE_EVENT_MUTATION = gql`
  mutation DeleteEvent($id: ID!) {
    deleteOneEvent(id: $id) {
      id
    }
  }
`;

// Mutation to update a task details
export const UPDATE_TASK_MUTATION = gql`
  mutation UpdateTask($input: UpdateOneTaskInput!) {
    updateOneTask(input: $input) {
      id
      title
      completed
      description
      dueDate
      stage {
        id
        title
      }
      users {
        id
        name
        avatarUrl
      }
      checklist {
        title
        checked
      }
    }
  }
`;

// Mutation to update applicant details
export const UPDATE_APPLICANT_MUTATION = gql`
  mutation UpdateApplicant($input: UpdateOneApplicantInput!) {
    updateOneApplicant(input: $input) {
      id
      name
      status
      strength
      imageUrl
      year
      major
      gender
      summary
      evaluators
      stages {
        stage_name
        stage_evaluators
        notes
        performance
      }
    }
  }
`;

// Mutation to create a new applicant
export const CREATE_APPLICANT_MUTATION = gql`
  mutation CreateApplicant($input: CreateOneApplicantInput!) {
    createOneApplicant(input: $input) {
      id
      name
      status
      strength
      imageUrl
      year
      major
      gender
      summary
      evaluators
      stages {
        stage_name
        stage_evaluators
        notes
        performance
      }
    }
  }
`;