import type { CreateJobRoleDto } from "../dto/job-role-createDto";
import type {
	CreateJobRoleFormValues,
	CreateJobRolePayload,
} from "../types/job-role-create";

export class JobRoleCreateMapper {
	public toFormValues(
		input?: Record<string, unknown>,
	): CreateJobRoleFormValues {
		return {
			name: typeof input?.name === "string" ? input.name.trim() : "",
			location:
				typeof input?.location === "string" ? input.location.trim() : "",
			capabilityId:
				typeof input?.capabilityId === "string" ? input.capabilityId : "",
			bandId: typeof input?.bandId === "string" ? input.bandId : "",
			closingDate:
				typeof input?.closingDate === "string" ? input.closingDate : "",
			description:
				typeof input?.description === "string" ? input.description : "",
			sharepointUrl:
				typeof input?.sharepointUrl === "string" ? input.sharepointUrl : "",
			responsibilities:
				typeof input?.responsibilities === "string"
					? input.responsibilities
					: "",
			numberOfOpenPositions:
				typeof input?.numberOfOpenPositions === "string"
					? input.numberOfOpenPositions
					: "",
		};
	}

	public toCreatePayload(input: CreateJobRoleDto): CreateJobRolePayload {
		return {
			name: input.name,
			location: input.location,
			capabilityId: input.capabilityId,
			bandId: input.bandId,
			closingDate: input.closingDate,
			description: input.description,
			sharepointUrl: input.sharepointUrl,
			responsibilities: input.responsibilities
				.split("\n")
				.map((item) => item.trim())
				.filter((item) => item.length > 0),
			numberOfOpenPositions: input.numberOfOpenPositions,
		};
	}
}

export default JobRoleCreateMapper;
