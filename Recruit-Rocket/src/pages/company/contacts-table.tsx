import { useParams } from "react-router-dom";

import { FilterDropdown, useTable } from "@refinedev/antd";
import { GetFieldsFromList } from "@refinedev/nestjs-query";

import {
  MailOutlined,
  PhoneOutlined,
  SearchOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { Button, Card, Input, Select, Space, Table } from "antd";

import { statusOptions } from "@/constants";
import { COMPANY_CONTACTS_TABLE_QUERY } from "@/graphql/queries";

import { CompanyContactsTableQuery } from "@/graphql/types";
import { Text } from "@/components/text";
import CustomAvatar from "@/components/custom-avatar";
import { ContactStatusTag } from "@/components/tags/contact-status-tag";

type Contact = GetFieldsFromList<CompanyContactsTableQuery>;

export const CompanyContactsTable = () => {
  // get params from the url
  const params = useParams();

  /**
   * Refine offers a TanStack Table adapter with @refinedev/react-table that allows us to use the TanStack Table library with Refine.
   * All features such as sorting, filtering, and pagination come out of the box
   * Under the hood it uses useList hook to fetch the data.
   * https://refine.dev/docs/packages/tanstack-table/use-table/#installation
   */
  const { tableProps } = useTable<Contact>({
    // specify the resource for which the table is to be used
    resource: "contacts",
    syncWithLocation: false,
    // specify initial sorters
    sorters: {
      /**
       * initial sets the initial value of sorters.
       * it's not permanent
       * it will be cleared when the user changes the sorting
       * https://refine.dev/docs/ui-integrations/ant-design/hooks/use-table/#sortersinitial
       */
      initial: [
        {
          field: "createdAt",
          order: "desc",
        },
      ],
    },
    // specify initial filters
    filters: {
      /**
       * similar to initial in sorters
       * https://refine.dev/docs/ui-integrations/ant-design/hooks/use-table/#filtersinitial
       */
      initial: [
        {
          field: "jobTitle",
          value: "",
          operator: "contains",
        },
        {
          field: "name",
          value: "",
          operator: "contains",
        },
        {
          field: "status",
          value: undefined,
          operator: "in",
        },
      ],
      /**
       * permanent filters are the filters that are always applied
       * https://refine.dev/docs/ui-integrations/ant-design/hooks/use-table/#filterspermanent
       */
      permanent: [
        {
          field: "company.id",
          operator: "eq",
          value: params?.id as string,
        },
      ],
    },
    /**
     * used to provide any additional information to the data provider.
     * https://refine.dev/docs/data/hooks/use-form/#meta-
     */
    meta: {
      // gqlQuery is used to specify the GraphQL query that should be used to fetch the data.
      gqlQuery: COMPANY_CONTACTS_TABLE_QUERY,
    },
  });

  return (
    <Card
      headStyle={{
        borderBottom: "1px solid #D9D9D9",
        marginBottom: "1px",
      }}
      bodyStyle={{ padding: 0 }}
      title={
        <Space size="middle">
          <TeamOutlined />
          <Text>Contacts</Text>
        </Space>
      }
      // property used to render additional content in the top-right corner of the card
      extra={
        <>
          <Text className="tertiary">Total contacts: </Text>
          <Text strong>
            {/* if pagination is not disabled and total is provided then show the total */}
            {tableProps?.pagination !== false && tableProps.pagination?.total}
          </Text>
        </>
      }
    >
      <Table
        {...tableProps}
        rowKey="id"
        pagination={{
          ...tableProps.pagination,
          showSizeChanger: false, // hide the page size changer
        }}
      >
        <Table.Column<Contact>
          title="Name"
          dataIndex="name"
          render={(_, record) => (
            <Space>
              <CustomAvatar name={record.name} src={record.avatarUrl} />
              <Text
                style={{
                  whiteSpace: "nowrap",
                }}
              >
                {record.name}
              </Text>
            </Space>
          )}
          // specify the icon that should be used for filtering
          filterIcon={<SearchOutlined />}
          // render the filter dropdown
          filterDropdown={(props) => (
            <FilterDropdown {...props}>
              <Input placeholder="Search Name" />
            </FilterDropdown>
          )}
        />
        <Table.Column
          title="Title"
          dataIndex="jobTitle"
          filterIcon={<SearchOutlined />}
          filterDropdown={(props) => (
            <FilterDropdown {...props}>
              <Input placeholder="Search Title" />
            </FilterDropdown>
          )}
        />
        <Table.Column<Contact>
          title="Stage"
          dataIndex="status"
          // render the status tag for each contact
          render={(_, record) => <ContactStatusTag status={record.status} />}
          // allow filtering by selecting multiple status options
          filterDropdown={(props) => (
            <FilterDropdown {...props}>
              <Select
                style={{ width: "200px" }}
                mode="multiple" // allow multiple selection
                placeholder="Select Stage"
                options={statusOptions}
              ></Select>
            </FilterDropdown>
          )}
        />
        <Table.Column<Contact>
          dataIndex="id"
          width={112}
          render={(_, record) => (
            <Space>
              <Button
                size="small"
                href={`mailto:${record.email}`}
                icon={<MailOutlined />}
              />
              <Button
                size="small"
                href={`tel:${record.phone}`}
                icon={<PhoneOutlined />}
              />
            </Space>
          )}
        />
      </Table>
    </Card>
  );
};
// import React from "react";
// import { useTable, List, Table, TextField } from "@pankod/refine-antd";
// import { useMany } from "@pankod/refine-core";
// import { Applicant } from "../../graphql/types";
// import applicantsData from "../../mocks/mock-applicants";

// const typedApplicantsData: Applicant[] = applicantsData;

// export const CompanyContactsTable: React.FC = () => {
//   const { tableProps } = useTable<Applicant>({
//     dataSource: typedApplicantsData,
//     initialSorter: [
//       {
//         field: "createdAt",
//         order: "desc",
//       },
//     ],
//   });

//   const evaluatorIds = tableProps?.dataSource?.flatMap(item => item.evaluators) ?? [];
//   const { data: evaluatorData, isLoading: evaluatorLoading } = useMany({
//     resource: "users",
//     ids: evaluatorIds,
//   });

//   const evaluatorMap = evaluatorData?.data?.reduce((acc: Record<string, string>, evaluator) => {
//     acc[evaluator.id] = evaluator.name;
//     return acc;
//   }, {});

//   return (
//     <List>
//       <Table {...tableProps} rowKey="id">
//         <Table.Column dataIndex="name" title="Name" render={(value) => <TextField value={value} />} />
//         <Table.Column dataIndex="status" title="Status" render={(value) => <TextField value={value} />} />
//         <Table.Column dataIndex="strength" title="Strength" render={(value) => <TextField value={value} />} />
//         <Table.Column dataIndex="imageUrl" title="Image" render={(value) => <img src={value} alt="Applicant" width={50} />} />
//         <Table.Column dataIndex="year" title="Year" render={(value) => <TextField value={value} />} />
//         <Table.Column dataIndex="major" title="Major" render={(value) => <TextField value={value} />} />
//         <Table.Column dataIndex="gender" title="Gender" render={(value) => <TextField value={value} />} />
//         <Table.Column dataIndex="summary" title="Summary" render={(value) => <TextField value={value} />} />
//         <Table.Column
//           dataIndex="evaluators"
//           title="Evaluators"
//           render={(evaluators: string[]) =>
//             evaluatorLoading ? (
//               "Loading..."
//             ) : (
//               evaluators.map(id => <div key={id}>{evaluatorMap?.[id]}</div>)
//             )
//           }
//         />
//         <Table.Column
//           dataIndex="stages"
//           title="Stages"
//           render={(stages: Applicant["stages"]) =>
//             stages.map(stage => (
//               <div key={stage.stage_name}>
//                 <div>Stage: {stage.stage_name}</div>
//                 <div>Evaluators: {stage.stage_evaluators.join(", ")}</div>
//                 <div>Notes: {stage.notes}</div>
//                 <div>Performance: {stage.performance}</div>
//               </div>
//             ))
//           }
//         />
//       </Table>
//     </List>
//   );
// };