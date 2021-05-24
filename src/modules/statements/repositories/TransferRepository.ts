import { getRepository, Repository } from "typeorm";
import { Transfer } from "../entities/Transfer";
import { ICreateTransferDTO } from "../useCases/createTransfer/ICreateTransferDTO";
import { ITransferRepository } from "./ITransferRepository";

class TransferRepository implements ITransferRepository {
  private repository: Repository<Transfer>

  constructor() {
    this.repository = getRepository(Transfer)
  }
  async create({ sender_id, recipient_id }: ICreateTransferDTO): Promise<Transfer> {
    const transfer = this.repository.create({
      recipient_id,
      sender_id
    });

    await this.repository.save(transfer);
    return transfer;
  }
}
export { TransferRepository }
