import { Transfer } from "../entities/Transfer";
import { ICreateTransferDTO } from "../useCases/createTransfer/ICreateTransferDTO";

interface ITransferRepository {
  create(data: ICreateTransferDTO): Promise<Transfer>
}
export { ITransferRepository }
