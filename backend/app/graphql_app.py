import strawberry
from strawberry.fastapi import GraphQLRouter
from typing import List, Optional, ForwardRef
from datetime import datetime
from enum import Enum

# Enums
@strawberry.enum
class Role(Enum):
    ADMIN = "ADMIN"
    USER = "USER"

@strawberry.enum
class ContactStatus(Enum):
    NEW = "NEW"
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"

@strawberry.enum
class ApplicantStatus(Enum):
    REJECTED = "rejected"
    CONSIDERING = "considering"
    ACCEPTED = "accepted"

# Types
@strawberry.type
class User:
    id: str
    name: str
    avatarUrl: Optional[str]
    email: str
    phone: Optional[str]
    jobTitle: Optional[str]
    role: Role

@strawberry.type
class Company:
    id: str
    name: str
    avatarUrl: Optional[str]
    totalRevenue: Optional[int]
    industry: Optional[str]
    companySize: Optional[str]
    businessType: Optional[str]
    country: Optional[str]
    website: Optional[str]
    salesOwner: User

@strawberry.type
class Contact:
    id: str
    name: str
    avatarUrl: Optional[str]
    jobTitle: Optional[str]
    email: str
    phone: Optional[str]
    status: ContactStatus

@strawberry.type
class Deal:
    id: str
    title: str
    value: float
    stageId: str
    companyId: str
    createdAt: datetime

@strawberry.type
class Task:
    id: str
    title: str
    description: Optional[str]
    dueDate: Optional[datetime]
    completed: bool
    stageId: Optional[str]
    users: List[User]
    createdAt: datetime
    updatedAt: datetime

@strawberry.type
class TaskStage:
    id: str
    title: str

@strawberry.type
class CheckListItem:
    title: str
    checked: bool

@strawberry.type
class Stage:
    stage_name: str
    stage_evaluators: List[str]
    notes: str
    performance: int

@strawberry.type
class Applicant:
    id: str
    name: str
    status: ApplicantStatus
    strength: int
    imageUrl: str
    year: int
    major: str
    gender: str
    summary: str
    evaluators: List[str]
    stages: List[Stage]

@strawberry.type
class CompanyConnection:
    nodes: List[Company]
    totalCount: int

@strawberry.type
class ContactConnection:
    nodes: List[Contact]
    totalCount: int

@strawberry.type
class DealConnection:
    nodes: List[Deal]
    totalCount: int

@strawberry.type
class DashboardTotalCounts:
    companies: CompanyConnection
    contacts: ContactConnection
    deals: DealConnection

@strawberry.type
class TaskConnection:
    nodes: List[Task]
    totalCount: int

@strawberry.type
class TaskStageConnection:
    nodes: List[TaskStage]
    totalCount: int

@strawberry.type
class ApplicantConnection:
    nodes: List[Applicant]
    totalCount: int

@strawberry.type
class Event:
    id: str
    title: str
    color: str
    startDate: datetime
    endDate: datetime

@strawberry.type
class EventConnection:
    nodes: List[Event]
    totalCount: int

@strawberry.type
class Audit:
    id: str
    action: str
    targetEntity: str
    targetId: str
    changes: List[str]
    createdAt: datetime
    user: Optional[User]

@strawberry.type
class AuditConnection:
    nodes: List[Audit]
    totalCount: int

@strawberry.input
class EventFilter:
    title: Optional[str] = None
    startDate: Optional[datetime] = None

@strawberry.input
class EventSort:
    field: str
    direction: str

@strawberry.input
class AuditFilter:
    action: Optional[str] = None
    targetEntity: Optional[str] = None

@strawberry.input
class AuditSort:
    field: str
    direction: str

@strawberry.input
class OffsetPaging:
    offset: int
    limit: int

@strawberry.input
class StageInput:
    stage_name: str
    stage_evaluators: List[str]
    notes: str
    performance: int

@strawberry.input
class UpdateOneUserInput:
    id: str
    name: Optional[str]
    email: Optional[str]
    phone: Optional[str]
    jobTitle: Optional[str]

@strawberry.input
class CreateOneCompanyInput:
    name: str
    salesOwnerId: str

@strawberry.input
class UpdateOneCompanyInput:
    id: str
    name: Optional[str]
    totalRevenue: Optional[int]
    industry: Optional[str]
    companySize: Optional[str]
    businessType: Optional[str]
    country: Optional[str]
    website: Optional[str]
    salesOwnerId: Optional[str]

@strawberry.input
class UpdateOneTaskInput:
    id: str
    title: Optional[str]
    description: Optional[str]
    dueDate: Optional[datetime]
    completed: Optional[bool]
    stageId: Optional[str]
    userIds: Optional[List[str]]

@strawberry.input
class CreateOneTaskInput:
    title: str
    description: Optional[str]
    dueDate: Optional[datetime]
    stageId: Optional[str]
    userIds: Optional[List[str]]

@strawberry.input
class UpdateOneApplicantInput:
    id: str
    name: Optional[str]
    status: Optional[ApplicantStatus]
    strength: Optional[int]
    imageUrl: Optional[str]
    year: Optional[int]
    major: Optional[str]
    gender: Optional[str]
    summary: Optional[str]
    evaluators: Optional[List[str]]
    stages: Optional[List[StageInput]]

@strawberry.input
class CreateOneApplicantInput:
    name: str
    status: ApplicantStatus
    strength: int
    imageUrl: str
    year: int
    major: str
    gender: str
    summary: str
    evaluators: List[str]
    stages: List[StageInput]

@strawberry.input
class CompanyFilter:
    name: Optional[str] = None
    industry: Optional[str] = None

@strawberry.input
class CompanySort:
    field: str
    direction: str

@strawberry.input
class ContactFilter:
    name: Optional[str] = None
    email: Optional[str] = None

@strawberry.input
class ContactSort:
    field: str
    direction: str

@strawberry.input
class DealFilter:
    title: Optional[str] = None
    value: Optional[float] = None

@strawberry.input
class DealSort:
    field: str
    direction: str

@strawberry.input
class TaskFilter:
    title: Optional[str] = None
    completed: Optional[bool] = None

@strawberry.input
class TaskSort:
    field: str
    direction: str

@strawberry.input
class TaskStageFilter:
    title: Optional[str] = None

@strawberry.input
class TaskStageSort:
    field: str
    direction: str

@strawberry.input
class ApplicantFilter:
    name: Optional[str] = None
    status: Optional[ApplicantStatus] = None

@strawberry.input
class ApplicantSort:
    field: str
    direction: str

@strawberry.type
class Query:
    @strawberry.field
    def dashboard_total_counts(self) -> DashboardTotalCounts:
        # Implement logic to fetch these counts
        return DashboardTotalCounts(
            companies=CompanyConnection(nodes=[], totalCount=0),
            contacts=ContactConnection(nodes=[], totalCount=0),
            deals=DealConnection(nodes=[], totalCount=0)
        )

    @strawberry.field
    def companies(self, filter: Optional[CompanyFilter] = None, paging: Optional[OffsetPaging] = None, sorting: Optional[List[CompanySort]] = None) -> CompanyConnection:
        # Implement logic to fetch companies
        return CompanyConnection(nodes=[], totalCount=0)

    @strawberry.field
    def contacts(self, filter: Optional[ContactFilter] = None, paging: Optional[OffsetPaging] = None, sorting: Optional[List[ContactSort]] = None) -> ContactConnection:
        # Implement logic to fetch contacts
        return ContactConnection(nodes=[], totalCount=0)

    @strawberry.field
    def deals(self, filter: Optional[DealFilter] = None, paging: Optional[OffsetPaging] = None, sorting: Optional[List[DealSort]] = None) -> DealConnection:
        # Implement logic to fetch deals
        return DealConnection(nodes=[], totalCount=0)

    @strawberry.field
    def events(self, filter: Optional[EventFilter] = None, paging: Optional[OffsetPaging] = None, sorting: Optional[List[EventSort]] = None) -> EventConnection:
        # Implement logic to fetch events
        return EventConnection(nodes=[], totalCount=0)

    @strawberry.field
    def audits(self, filter: Optional[AuditFilter] = None, paging: Optional[OffsetPaging] = None, sorting: Optional[List[AuditSort]] = None) -> AuditConnection:
        # Implement logic to fetch audits
        return AuditConnection(nodes=[], totalCount=0)

@strawberry.type
class Mutation:
    @strawberry.mutation
    def update_user(self, input: UpdateOneUserInput) -> User:
        # Implement logic to update user
        pass

    @strawberry.mutation
    def create_company(self, input: CreateOneCompanyInput) -> Company:
        # Implement logic to create company
        pass

    @strawberry.mutation
    def update_company(self, input: UpdateOneCompanyInput) -> Company:
        # Implement logic to update company
        pass

    @strawberry.mutation
    def update_task(self, input: UpdateOneTaskInput) -> Task:
        # Implement logic to update task
        pass

    @strawberry.mutation
    def create_task(self, input: CreateOneTaskInput) -> Task:
        # Implement logic to create task
        pass

    @strawberry.mutation
    def update_applicant(self, input: UpdateOneApplicantInput) -> Applicant:
        # Implement logic to update applicant
        pass

    @strawberry.mutation
    def create_applicant(self, input: CreateOneApplicantInput) -> Applicant:
        # Implement logic to create applicant
        pass

schema = strawberry.Schema(query=Query, mutation=Mutation)

graphql_app = GraphQLRouter(schema)